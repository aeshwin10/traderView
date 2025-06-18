# Stock Broker Client Dashboard

A real-time stock broker dashboard with JWT authentication, allowing users to subscribe to up to 5 stocks from the global top 200 by market cap, with live USD to INR price updates via WebSockets.

## 🚀 Features

- **🔐 JWT Authentication**: Secure user registration and login
- **📈 Real-time Stock Prices**: Live price updates every 30 seconds in INR
- **🔍 Smart Stock Search**: Search from top 200 global stocks by market cap
- **📊 5-Stock Limit**: Maximum 5 stock subscriptions per user
- **🌐 WebSocket Integration**: Real-time price broadcasting
- **💱 Currency Conversion**: Automatic USD to INR conversion with caching
- **📱 Material-UI Interface**: Professional, responsive design

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Socket.IO** for real-time WebSocket communication
- **SQLite3** for database
- **JWT** + **bcrypt** for authentication
- **Finnhub API** for stock data
- **CurrencyFreaks API** for currency conversion
- **node-cron** for scheduled tasks

### Frontend
- **React** + **TypeScript**
- **Material-UI** for UI components
- **Socket.IO Client** for real-time updates
- **Axios** for API calls

## 📁 Project Structure

```
Ashwin-project/
├── server/                 # Backend API server
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Authentication middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic services
│   │   └── app.ts         # Main server file
│   ├── package.json
│   └── .env               # Environment variables
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── App.tsx        # Main App component
│   ├── package.json
│   └── .env               # React environment variables
├── package.json           # Root package for unified scripts
└── requirements.md        # Detailed requirements and progress
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation & Setup

1. **Clone and install dependencies:**
```bash
cd Ashwin-project
npm run install:all
```

2. **Environment Variables:**
   - Server environment variables are already configured in `server/.env`
   - Client environment variables are configured in `client/.env`
   - API keys are included for testing purposes

3. **Start the application:**
```bash
# Start both servers simultaneously
npm run dev

# Or start separately:
npm run dev:server  # Backend on port 5000
npm run dev:client  # Frontend on port 3000
```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 📋 Usage

### 1. **User Registration/Login**
- Register with email and password (minimum 6 characters)
- Login with your credentials
- JWT token automatically managed

### 2. **Stock Search & Subscription**
- Search from 200+ global stocks by ticker or company name
- Add up to 5 stocks to your watchlist
- Real-time duplicate and limit validation

### 3. **Real-time Price Monitoring**
- View live stock prices in INR
- Prices update every 30 seconds
- WebSocket connection status indicator
- Remove unwanted subscriptions anytime

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Stocks
- `GET /api/stocks` - Get all available stocks
- `GET /api/stocks/search?query=` - Search stocks
- `POST /api/stocks/refresh` - Refresh stock list (admin)

### Subscriptions
- `GET /api/subscriptions` - Get user subscriptions
- `POST /api/subscriptions` - Add subscription
- `DELETE /api/subscriptions/:ticker` - Remove subscription

## 🔌 WebSocket Events

### Client → Server
- `authenticate` - Authenticate with JWT token

### Server → Client
- `authenticated` - Authentication response
- `priceUpdate` - Real-time price updates
```json
{
  "type": "priceUpdate",
  "data": {
    "AAPL": 2750.50,
    "GOOGL": 2880.25
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🎯 Key Features Implemented

✅ **Complete Authentication System** - Registration, login, JWT tokens  
✅ **Stock Data Management** - Top 200 stocks from Finnhub API  
✅ **Real-time Price Updates** - WebSocket broadcasting every 30 seconds  
✅ **Currency Conversion** - USD to INR with 1-hour caching  
✅ **5-Stock Subscription Limit** - User-friendly validation  
✅ **Professional UI** - Material-UI components  
✅ **Database Management** - SQLite with proper relationships  
✅ **Error Handling** - Comprehensive error management  
✅ **Scheduled Tasks** - Daily stock refresh, price updates  

## 🚨 Important Notes

- **API Keys**: Included for testing purposes only
- **Database**: SQLite database will be created automatically
- **Stock List**: Refreshes daily at 2:00 AM
- **Price Updates**: Every 30 seconds for subscribed stocks only
- **Currency Cache**: USD/INR rate cached for 1 hour

## 🔄 Scheduled Tasks

- **Stock Prices**: Updated every 30 seconds
- **Currency Rates**: Cached for 1 hour
- **Stock List**: Refreshed daily at 2:00 AM

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation
- SQL injection prevention

## 📈 Performance Optimizations

- Currency rate caching
- WebSocket room-based broadcasting
- Debounced search functionality
- Efficient database queries
- Real-time connection management

---

**🎉 Ready for Production!** The application is fully functional with all core features implemented and tested. 