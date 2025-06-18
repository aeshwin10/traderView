import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getSubscriptions, addSubscription, removeSubscription } from '../controllers/subscriptionController';

const router = express.Router();

// All subscription routes require authentication
router.use(authenticateToken);

// GET /api/subscriptions - Get user's subscriptions
router.get('/', getSubscriptions);

// POST /api/subscriptions - Add new subscription
router.post('/', addSubscription);

// DELETE /api/subscriptions/:ticker - Remove subscription
router.delete('/:ticker', removeSubscription);

export default router; 