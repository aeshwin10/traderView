import cron from 'node-cron';
import StockService from './stockService';
import CurrencyService from './currencyService';
import Database from '../models/database';
import { Server as SocketServer } from 'socket.io';

class SchedulerService {
  private stockService: StockService;
  private currencyService: CurrencyService;
  private db: Database;
  private io: SocketServer;
  private stockUpdateInterval: number;

  constructor(io: SocketServer) {
    this.stockService = new StockService();
    this.currencyService = new CurrencyService();
    this.db = new Database(process.env.DATABASE_PATH);
    this.io = io;
    this.stockUpdateInterval = parseInt(process.env.STOCK_UPDATE_INTERVAL || '30');
  }

  // Start all scheduled tasks
  start(): void {
    console.log('Starting scheduler service...');
    
    // Schedule stock price updates every 30 seconds (or configured interval)
    this.scheduleStockUpdates();
    
    // Schedule daily stock list refresh at 2 AM
    this.scheduleDailyStockRefresh();
    
    // Initial stock list population
    this.initialStockSetup();
  }

  // Schedule real-time stock price updates
  private scheduleStockUpdates(): void {
    const cronExpression = `*/${this.stockUpdateInterval} * * * * *`; // Every N seconds
    
    cron.schedule(cronExpression, async () => {
      try {
        await this.updateStockPrices();
      } catch (error) {
        console.error('Error in scheduled stock update:', error);
      }
    });

    console.log(`Stock price updates scheduled every ${this.stockUpdateInterval} seconds`);
  }

  // Schedule daily stock list refresh
  private scheduleDailyStockRefresh(): void {
    // Every day at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
      try {
        console.log('Starting daily stock list refresh...');
        await this.stockService.fetchTop200Stocks();
        console.log('Daily stock list refresh completed');
      } catch (error) {
        console.error('Error in daily stock refresh:', error);
      }
    });

    console.log('Daily stock list refresh scheduled for 2:00 AM');
  }

  // Update stock prices and broadcast to subscribed users
  private async updateStockPrices(): Promise<void> {
    try {
      // Get all unique tickers from user subscriptions
      const subscriptions = await this.getAllActiveSubscriptions();
      
      if (subscriptions.length === 0) {
        return; // No active subscriptions
      }

      const uniqueTickers = [...new Set(subscriptions.map(sub => sub.ticker))];
      
      // Fetch current prices from Finnhub
      const usdPrices = await this.stockService.getMultipleStockPrices(uniqueTickers);
      
      // Convert to INR
      const inrPrices = await this.currencyService.convertMultipleUSDToINR(usdPrices);
      
      // Group subscriptions by user
      const userSubscriptions = this.groupSubscriptionsByUser(subscriptions);
      
      // Broadcast prices to each user's room
      for (const [userId, userTickers] of Object.entries(userSubscriptions)) {
        const userPrices: { [ticker: string]: number } = {};
        
        userTickers.forEach(ticker => {
          if (inrPrices[ticker]) {
            userPrices[ticker] = Math.round(inrPrices[ticker] * 100) / 100; // Round to 2 decimal places
          }
        });

        if (Object.keys(userPrices).length > 0) {
          this.io.to(`user_${userId}`).emit('priceUpdate', {
            type: 'priceUpdate',
            data: userPrices,
            timestamp: new Date().toISOString()
          });
        }
      }

      console.log(`Updated prices for ${uniqueTickers.length} stocks, broadcasted to ${Object.keys(userSubscriptions).length} users`);
    } catch (error) {
      console.error('Error updating stock prices:', error);
    }
  }

  // Get all active subscriptions from database
  private async getAllActiveSubscriptions(): Promise<any[]> {
    try {
      // This method should be added to Database class, but for now we'll query directly
      const { promisify } = require('util');
      const all = promisify(this.db['db'].all.bind(this.db['db']));
      
      return await all(`
        SELECT DISTINCT s.user_id, s.ticker 
        FROM subscriptions s 
        INNER JOIN users u ON s.user_id = u.id
      `);
    } catch (error) {
      console.error('Error fetching active subscriptions:', error);
      return [];
    }
  }

  // Group subscriptions by user ID
  private groupSubscriptionsByUser(subscriptions: any[]): { [userId: string]: string[] } {
    const grouped: { [userId: string]: string[] } = {};
    
    subscriptions.forEach(sub => {
      if (!grouped[sub.user_id]) {
        grouped[sub.user_id] = [];
      }
      grouped[sub.user_id].push(sub.ticker);
    });
    
    return grouped;
  }

  // Initial setup to populate stock list
  private async initialStockSetup(): Promise<void> {
    try {
      // Wait a bit for database initialization to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if stocks table is empty
      const stocks = await this.stockService.getAllStocks();
      
      if (stocks.length === 0) {
        console.log('No stocks found in database, fetching initial stock list...');
        await this.stockService.fetchTop200Stocks();
        console.log('Initial stock list populated');
      } else {
        console.log(`Found ${stocks.length} stocks in database`);
      }
    } catch (error) {
      console.error('Error in initial stock setup:', error);
    }
  }
}

export default SchedulerService; 