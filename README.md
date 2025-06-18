# traderView

A real-time stock broker dashboard with JWT authentication, allowing users to subscribe to up to 5 stocks from the global top 200 by market cap, with live USD to INR price updates via WebSockets.

## Features

- JWT Authentication with secure user registration and login
- Real-time Stock Prices with live price updates every 30 seconds in INR
- Smart Stock Search from top 200 global stocks by market cap
- 5-Stock Limit with maximum 5 stock subscriptions per user
- WebSocket Integration for real-time price broadcasting
- Currency Conversion with automatic USD to INR conversion and caching
- Material-UI Interface with professional, responsive design

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- Socket.IO for real-time WebSocket communication
- SQLite3 for database
- JWT + bcrypt for authentication
- Finnhub API for stock data
- CurrencyFreaks API for currency conversion
- node-cron for scheduled tasks

### Frontend
- React + TypeScript
- Material-UI for UI components
- Socket.IO Client for real-time updates
- Axios for API calls

## Installation & Setup

1. Clone and install dependencies:
   ```bash
   cd Ashwin-project
   npm run install:all
   ```

2. Environment variables are already configured:
   - Server: `server/.env`
   - Client: `client/.env`
   - API keys included for testing

3. Start the application:
   ```bash
   npm run dev
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

traderView is a fully functional real-time stock dashboard ready for use with comprehensive authentication, live price updates, and professional UI.

