Stock Broker Client Dashboard Setup Prompt for Cursor

Use this markdown document as a single prompt file in Cursor to scaffold your entire project.

Project Overview

I am building a Stock Broker Client Dashboard as an interview assignment. The app must:

Allow users to register and log in using email and password (JWT-based auth)

Let users subscribe to real stocks via ticker codes (like GOOG, TSLA, etc.)

Show real-time stock price updates for their subscriptions

Convert stock prices from USD to INR

Use SQLite3 as the database

Use WebSockets for real-time updates

Use a currency conversion API and Finnhub for stock prices

Use a scheduler to fetch stock prices every 15–30 seconds

Be built with TypeScript, Node.js (Express), and React

🔐 Auth (JWT) Requirements

Use bcrypt to hash passwords

Use jsonwebtoken to sign tokens (expire in 1 day)

On login/register: return token in JSON

Protect all routes except login/register

📄 DB Schema Requirements

Use SQLite3

Tables:

users

id: INTEGER PRIMARY KEY AUTOINCREMENT

email: TEXT UNIQUE NOT NULL

password: TEXT NOT NULL (hashed)

created_at: DATETIME DEFAULT CURRENT_TIMESTAMP

subscriptions

id: INTEGER PRIMARY KEY AUTOINCREMENT

user_id: INTEGER NOT NULL

ticker: TEXT NOT NULL

created_at: DATETIME DEFAULT CURRENT_TIMESTAMP

UNIQUE(user_id, ticker)

FOREIGN KEY (user_id) REFERENCES users(id)

jwt_tokens (optional)

id: INTEGER PRIMARY KEY AUTOINCREMENT

user_id: INTEGER NOT NULL

token: TEXT NOT NULL

issued_at: DATETIME DEFAULT CURRENT_TIMESTAMP

FOREIGN KEY (user_id) REFERENCES users(id)

📊 Stock Subscriptions

Users can subscribe to 5 hardcoded tickers: GOOG, TSLA, AMZN, META, NVDA

Store subscriptions in DB

User can fetch their subscriptions (GET)

User can add/remove subscriptions (POST/DELETE)

📈 Real-Time Stock Data

Use Finnhub API to get latest prices

Use any free currency API (e.g., exchangerate-api.com) to convert to INR

Cache INR rate for 1 hour

Multiply price × INR rate before pushing

🔁 WebSockets

Clients connect via WebSocket

When new data is fetched (every 15–30 sec), push prices only for subscribed tickers

Suggested WebSocket payload format:

{
  type: "priceUpdate",
  data: {
    GOOG: 2500,
    TSLA: 840,
    ...
  }
}

🧠 Frontend (React + TypeScript)

LoginForm.tsx: call login API, save JWT in localStorage

Dashboard.tsx: after login, fetch subscriptions, connect to WebSocket

useWebSocket.ts: hook to receive real-time updates

Allow user to subscribe/unsubscribe via REST APIs

Dynamic Update Strategy

Use useEffect to establish and manage WebSocket connection

Use state management (useState) to update and render live prices

Conditional re-rendering based on received WebSocket messages

🧰 Scheduler

Use node-cron or setInterval

Every 15–30s: fetch all 5 stock prices from Finnhub

Every 1h: fetch USD→INR rate

Push only updated data via WebSocket

🔌 Backend API (REST)

Endpoints:

POST /register: Register new user

POST /login: Authenticate and return JWT

GET /subscriptions: Get user's subscriptions

POST /subscriptions: Add new ticker

DELETE /subscriptions: Remove ticker

⚙️ Async Details

API calls to stock and currency conversion are async (via fetch or axios)

WebSocket events are async message handlers

Cron job runs async tasks in intervals (with caching)

React useEffect + async calls for dynamic UI

✅ Workflow Summary

Backend Setup

Initialize DB and tables

Auth (register/login) using JWT

Subscription APIs

Add/remove subscriptions, fetch list

Stock Updater Job

Schedule price fetches, convert and broadcast

WebSocket Server

Send only updated data to subscribed users

Frontend

React UI, real-time updates via useEffect and WebSocket

Caching Layer

Cache INR rate for 1 hour to reduce API load