# Stock Broker Client Dashboard - Requirements & Progress Tracking

## 📋 Project Overview
Building a real-time Stock Broker Client Dashboard with JWT authentication, allowing users to subscribe to up to 5 stocks from the global top 200 by market cap, with live USD to INR price updates via WebSockets.

## 🔑 API Keys & External Services
- **Finnhub API**: Stock data and market screener
- **CurrencyFreaks API**: USD to INR conversion (`8d104c53e335464fa86772576778592d`)
- **Update Frequency**: Stock prices every 15-30 seconds, Currency rates cached for 1 hour
- **Stock List Refresh**: Daily update of top 200 stocks by market cap

---

## 🎯 HIGH PRIORITY (P1) - Core Functionality

### Backend Infrastructure
- [x] **P1.1** - Initialize fresh project structure (server/client directories)
- [x] **P1.2** - Set up package.json with TypeScript, Express, Socket.IO dependencies
- [x] **P1.3** - Create environment configuration (.env with API keys)
- [x] **P1.4** - Set up SQLite3 database with proper schema
- [x] **P1.5** - Create comprehensive .gitignore file

### Database Schema Design
- [x] **P1.6** - Create `users` table (id, email, password_hash, created_at)
- [x] **P1.7** - Create `subscriptions` table (id, user_id, ticker, created_at, UNIQUE constraint)
- [x] **P1.8** - Create `stocks` table (id, ticker, name, market_cap, exchange, updated_at)
- [x] **P1.9** - Create `jwt_tokens` table (optional for token management)

### Authentication System
- [x] **P1.10** - Implement user registration (POST /api/register)
- [x] **P1.11** - Implement user login (POST /api/login)
- [x] **P1.12** - Set up JWT token generation (1-day expiry)
- [x] **P1.13** - Implement bcrypt password hashing
- [x] **P1.14** - Create authentication middleware for protected routes

### Stock Data Management
- [x] **P1.15** - Fetch top 200 global stocks by market cap from Finnhub
- [x] **P1.16** - Implement daily stock list refresh job
- [x] **P1.17** - Create stock search API (GET /api/stocks/search?query=)
- [x] **P1.18** - Implement stock list caching strategy

### Subscription Management APIs
- [x] **P1.19** - GET /api/subscriptions - Fetch user's current subscriptions
- [x] **P1.20** - POST /api/subscriptions - Add new stock subscription (max 5 limit)
- [x] **P1.21** - DELETE /api/subscriptions/:ticker - Remove stock subscription
- [x] **P1.22** - Validate subscription limits and duplicates

### Real-time Data Pipeline
- [x] **P1.23** - Integrate Finnhub API for live stock prices
- [x] **P1.24** - Integrate CurrencyFreaks API for USD→INR conversion
- [x] **P1.25** - Implement currency rate caching (1-hour TTL)
- [x] **P1.26** - Set up node-cron scheduler for price updates (15-30s intervals)
- [x] **P1.27** - Calculate INR prices (USD price × conversion rate)

### WebSocket Implementation
- [x] **P1.28** - Set up Socket.IO server with Express
- [x] **P1.29** - Implement user-specific room management
- [x] **P1.30** - Broadcast price updates only to subscribed users
- [x] **P1.31** - Define WebSocket message format:
```json
{
  "type": "priceUpdate",
  "data": {
    "AAPL": 2750.50,
    "GOOGL": 2880.25
  }
}
```

---

## 🎨 MEDIUM PRIORITY (P2) - Frontend Development

### React Application Setup
- [x] **P2.1** - Initialize React app with TypeScript
- [x] **P2.2** - Set up Material-UI theme and components
- [x] **P2.3** - Configure routing with React Router
- [x] **P2.4** - Set up state management structure

### Authentication UI Components
- [x] **P2.5** - Create LoginForm component with Material-UI
- [x] **P2.6** - Create RegisterForm component with validation
- [x] **P2.7** - Implement JWT storage in localStorage
- [x] **P2.8** - Create ProtectedRoute wrapper component
- [x] **P2.9** - Add logout functionality

### Stock Search & Selection UI
- [x] **P2.10** - Create searchable dropdown component for stock selection
- [x] **P2.11** - Implement debounced search functionality
- [x] **P2.12** - Display stock details (ticker, name, exchange)
- [x] **P2.13** - Add stock subscription button with 5-stock limit validation
- [x] **P2.14** - Show popup message when trying to exceed 5 stocks

### Dashboard Components
- [x] **P2.15** - Create main Dashboard layout
- [x] **P2.16** - Display user's current stock subscriptions
- [x] **P2.17** - Show real-time stock prices in INR
- [x] **P2.18** - Add remove subscription functionality
- [x] **P2.19** - Display last updated timestamp

### WebSocket Integration
- [x] **P2.20** - Create useWebSocket custom hook
- [x] **P2.21** - Implement real-time price updates in dashboard
- [x] **P2.22** - Handle WebSocket connection states (connecting, connected, disconnected)
- [x] **P2.23** - Add connection retry logic

---

## 🔧 LOW PRIORITY (P3) - Enhancement & Polish

### Error Handling & UX
- [ ] **P3.1** - Add comprehensive error boundaries
- [ ] **P3.2** - Implement loading states for all async operations
- [ ] **P3.3** - Add success/error toast notifications
- [ ] **P3.4** - Create 404 and error pages
- [ ] **P3.5** - Add form validation feedback

### Performance Optimization
- [ ] **P3.6** - Implement React.memo for price components
- [ ] **P3.7** - Add debouncing for search inputs
- [ ] **P3.8** - Optimize WebSocket message handling
- [ ] **P3.9** - Add proper cleanup on component unmount

### Testing & Documentation
- [ ] **P3.10** - Add API endpoint testing
- [ ] **P3.11** - Create component unit tests
- [ ] **P3.12** - Add integration tests for WebSocket functionality
- [ ] **P3.13** - Document API endpoints
- [ ] **P3.14** - Create deployment guide

---

## 📁 Project Structure
```
Ashwin-project/
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.ts
│   ├── package.json
│   └── .env
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   └── package.json
├── package.json (root)
├── requirements.md
└── README.md
```

## 🚀 Technical Stack
- **Backend**: Node.js, Express, TypeScript, Socket.IO, SQLite3
- **Frontend**: React, TypeScript, Material-UI, Socket.IO Client
- **Authentication**: JWT, bcrypt
- **APIs**: Finnhub (stocks), CurrencyFreaks (forex)
- **Scheduling**: node-cron
- **Database**: SQLite3

## 📊 Success Criteria
✅ Users can register and login securely  
✅ Users can search and subscribe to stocks from top 200 global stocks  
✅ Maximum 5 stock subscriptions per user enforced  
✅ Real-time price updates in INR every 15-30 seconds  
✅ WebSocket connections properly managed  
✅ Daily refresh of available stock list  
✅ Professional Material-UI interface  

---

## 📝 Notes
- Focus on functionality over aesthetics initially
- UI will be enhanced later with v0
- Database file should be gitignored
- All API keys stored in environment variables
- Error handling should be user-friendly but simple 