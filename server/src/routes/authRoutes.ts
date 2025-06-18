import express from 'express';
import { register, login } from '../controllers/authController';

const router = express.Router();

// POST /api/register - Register new user
router.post('/register', register);

// POST /api/login - Login user
router.post('/login', login);

export default router; 