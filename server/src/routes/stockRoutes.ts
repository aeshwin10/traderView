import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { searchStocks, getAllStocks, refreshStockList } from '../controllers/stockController';

const router = express.Router();

// All stock routes require authentication
router.use(authenticateToken);

// GET /api/stocks/search - Search stocks
router.get('/search', searchStocks);

// GET /api/stocks - Get all available stocks
router.get('/', getAllStocks);

// POST /api/stocks/refresh - Refresh stock list (admin function)
router.post('/refresh', refreshStockList);

export default router; 