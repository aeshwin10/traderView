import axios from 'axios';
import Database from '../models/database';

interface FinnhubStock {
  symbol: string;
  displaySymbol: string;
  description: string;
  type: string;
  mic: string;
  figi: string;
  currency: string;
  shareClassFIGI: string;
  symbol2: string;
}

interface StockPrice {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
}

class StockService {
  private db: Database;
  private finnhubApiKey: string;
  private finnhubBaseUrl: string;

  constructor() {
    this.db = new Database(process.env.DATABASE_PATH);
    this.finnhubApiKey = process.env.FINNHUB_API_KEY || '';
    this.finnhubBaseUrl = process.env.FINNHUB_BASE_URL || 'https://finnhub.io/api/v1';
  }

  // Fetch top US stocks from NYSE and NASDAQ with price validation
  async fetchTop200Stocks(): Promise<void> {
    try {
      console.log('Fetching top US stocks from Finnhub with price validation...');
      
      // Focus on US exchanges only (NYSE and NASDAQ)
      const exchanges = ['US']; // US covers both NYSE and NASDAQ
      const allValidStocks: any[] = [];
      
      // Priority stocks that must be included (major US stocks)
      const priorityStocks = [
        'GOOGL', 'GOOG', 'NVDA', 'TSLA', 'META', 'AMZN', 'AAPL', 'MSFT',
        'TSLA', 'NFLX', 'AMD', 'INTC', 'CRM', 'UBER', 'PYPL', 'ADBE',
        'ORCL', 'CSCO', 'IBM', 'QCOM', 'TXN', 'AVGO', 'COST', 'SBUX',
        'PEP', 'KO', 'MCD', 'WMT', 'HD', 'DIS', 'V', 'MA', 'JPM', 'BAC'
      ];

      for (const exchange of exchanges) {
        try {
          console.log(`Fetching stocks from ${exchange} exchange...`);
          const response = await axios.get(
            `${this.finnhubBaseUrl}/stock/symbol`,
            {
              params: {
                exchange,
                token: this.finnhubApiKey
              }
            }
          );

          // Filter for common stocks and valid symbols
          let stocks = response.data
            .filter((stock: FinnhubStock) => 
              stock.type === 'Common Stock' && 
              stock.symbol && 
              stock.description &&
              !stock.symbol.includes('.') && // Avoid complex symbols
              !stock.symbol.includes('-') && // Avoid warrants/rights
              stock.symbol.length <= 5 && // Standard ticker length
              /^[A-Z]+$/.test(stock.symbol) // Only uppercase letters
            );

          // Prioritize our must-have stocks
          const priorityStockData = stocks.filter((stock: FinnhubStock) => 
            priorityStocks.includes(stock.symbol)
          );
          
          // Get other stocks, sorted by description (company name)
          const otherStocks = stocks
            .filter((stock: FinnhubStock) => !priorityStocks.includes(stock.symbol))
            .sort((a: FinnhubStock, b: FinnhubStock) => a.description.localeCompare(b.description))
            .slice(0, 200); // Take up to 200 other stocks

          // Combine priority stocks first, then others
          const combinedStocks = [...priorityStockData, ...otherStocks];

          console.log(`Found ${combinedStocks.length} stocks from ${exchange}, validating prices...`);

          // Validate each stock has real-time price data
          for (const stock of combinedStocks.slice(0, 200)) {
            try {
              // Test if we can get price for this stock
              const priceData = await this.getStockPrice(stock.symbol);
              
              if (priceData && priceData.c > 0) {
                // Stock has valid price data
                await this.db.upsertStock(
                  stock.symbol,
                  stock.description,
                  0, // Market cap will be calculated later if needed
                  'US'
                );
                
                allValidStocks.push({
                  ticker: stock.symbol,
                  name: stock.description,
                  exchange: 'US'
                });

                console.log(`✓ Added ${stock.symbol} (${stock.description}) - Price: $${priceData.c}`);
              } else {
                console.log(`✗ Skipped ${stock.symbol} - No valid price data`);
              }
            } catch (error) {
              console.log(`✗ Skipped ${stock.symbol} - Price validation failed`);
            }

            // Stop if we have enough stocks
            if (allValidStocks.length >= 150) {
              break;
            }
          }

        } catch (error) {
          console.error(`Error fetching stocks from ${exchange}:`, error);
        }
      }

      console.log(`Successfully stored ${allValidStocks.length} validated US stocks in database`);
      
      // Verify priority stocks were added
      const addedPriorityStocks = allValidStocks.filter(stock => 
        priorityStocks.includes(stock.ticker)
      );
      console.log(`Priority stocks added: ${addedPriorityStocks.map(s => s.ticker).join(', ')}`);
      
    } catch (error) {
      console.error('Error fetching top stocks:', error);
    }
  }

  // Get stock price from Finnhub
  async getStockPrice(ticker: string): Promise<StockPrice | null> {
    try {
      const response = await axios.get(
        `${this.finnhubBaseUrl}/quote`,
        {
          params: {
            symbol: ticker,
            token: this.finnhubApiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error fetching price for ${ticker}:`, error);
      return null;
    }
  }

  // Get prices for multiple stocks
  async getMultipleStockPrices(tickers: string[]): Promise<{ [ticker: string]: number }> {
    const prices: { [ticker: string]: number } = {};
    
    // Use Promise.allSettled to handle partial failures
    const pricePromises = tickers.map(async (ticker) => {
      const stockPrice = await this.getStockPrice(ticker);
      return { ticker, price: stockPrice?.c || 0 };
    });

    const results = await Promise.allSettled(pricePromises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.price > 0) {
        prices[result.value.ticker] = result.value.price;
      }
    });

    return prices;
  }

  // Search stocks from database
  async searchStocks(query: string): Promise<any[]> {
    return await this.db.searchStocks(query);
  }

  // Get all available stocks
  async getAllStocks(): Promise<any[]> {
    return await this.db.getAllStocks();
  }
}

export default StockService; 