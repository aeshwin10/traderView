import { Request, Response } from 'express';
import StockService from '../services/stockService';

const stockService = new StockService();

export const searchStocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const stocks = await stockService.searchStocks(query);
    
    res.json({
      stocks,
      count: stocks.length
    });
  } catch (error) {
    console.error('Error searching stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllStocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await stockService.getAllStocks();
    
    res.json({
      stocks,
      count: stocks.length
    });
  } catch (error) {
    console.error('Error fetching all stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshStockList = async (req: Request, res: Response): Promise<void> => {
  try {
    await stockService.fetchTop200Stocks();
    
    res.json({
      message: 'Stock list refreshed successfully'
    });
  } catch (error) {
    console.error('Error refreshing stock list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 