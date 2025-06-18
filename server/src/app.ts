import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import stockRoutes from './routes/stockRoutes';

// Import services
import SchedulerService from './services/schedulerService';
import { authenticateToken } from './middleware/auth';

// Create Express app
const app = express();
const server = http.createServer(app);

// Setup Socket.IO with CORS
const io = new SocketServer(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Stock Broker Dashboard API'
  });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/stocks', stockRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle user authentication for WebSocket
  socket.on('authenticate', (token: string) => {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Join user-specific room
      socket.join(`user_${decoded.id}`);
      socket.userId = decoded.id;
      
      console.log(`User ${decoded.id} authenticated and joined room`);
      
      socket.emit('authenticated', {
        success: true,
        userId: decoded.id
      });
    } catch (error) {
      console.error('Socket authentication failed:', error);
      socket.emit('authenticated', {
        success: false,
        error: 'Invalid token'
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (socket.userId) {
      socket.leave(`user_${socket.userId}`);
    }
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Start scheduler service
const schedulerService = new SchedulerService(io);
schedulerService.start();

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Stock Broker Dashboard API started`);
  console.log(`🔗 WebSocket server ready`);
  console.log(`📈 Real-time price updates enabled`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 API Health Check: http://localhost:${PORT}/health`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app; 