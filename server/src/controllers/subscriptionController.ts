import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Database from '../models/database';

const db = new Database(process.env.DATABASE_PATH);

export const getSubscriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const subscriptions = await db.getSubscriptions(userId);
    res.json({
      subscriptions,
      count: subscriptions.length
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { ticker } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!ticker) {
      res.status(400).json({ error: 'Ticker symbol is required' });
      return;
    }

    // Check if user already has 5 subscriptions
    const currentCount = await db.getSubscriptionCount(userId);
    if (currentCount >= 5) {
      res.status(400).json({ 
        error: 'Maximum 5 stock subscriptions allowed per user',
        currentCount 
      });
      return;
    }

    // Check if subscription already exists
    const existingSubscriptions = await db.getSubscriptions(userId);
    const alreadySubscribed = existingSubscriptions.some(sub => sub.ticker === ticker.toUpperCase());
    
    if (alreadySubscribed) {
      res.status(409).json({ error: 'Already subscribed to this stock' });
      return;
    }

    // Add subscription
    await db.addSubscription(userId, ticker.toUpperCase());
    
    res.status(201).json({
      message: 'Subscription added successfully',
      ticker: ticker.toUpperCase()
    });
  } catch (error) {
    console.error('Error adding subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { ticker } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!ticker) {
      res.status(400).json({ error: 'Ticker symbol is required' });
      return;
    }

    await db.removeSubscription(userId, ticker.toUpperCase());
    
    res.json({
      message: 'Subscription removed successfully',
      ticker: ticker.toUpperCase()
    });
  } catch (error) {
    console.error('Error removing subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 