import express from 'express';
import { register, login, clearAllUsers } from '../controllers/authController';

const router = express.Router();

// POST /api/register - Register new user
router.post('/register', register);

// POST /api/login - Login user
router.post('/login', login);

// DELETE /api/clear-users - Clear all users (development only)
router.delete('/clear-users', clearAllUsers);

export default router; 