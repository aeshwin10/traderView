import sqlite3 from 'sqlite3';
import path from 'path';

class Database {
  private db: sqlite3.Database;
  
  constructor(dbPath: string = './database.db') {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        this.initializeTables();
      }
    });
  }

  private async initializeTables(): Promise<void> {
    const tables = [
      {
        name: 'users',
        sql: `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'subscriptions',
        sql: `CREATE TABLE IF NOT EXISTS subscriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          ticker TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, ticker),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
      },
      {
        name: 'stocks',
        sql: `CREATE TABLE IF NOT EXISTS stocks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ticker TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          market_cap REAL,
          exchange TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'jwt_tokens',
        sql: `CREATE TABLE IF NOT EXISTS jwt_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          token TEXT NOT NULL,
          issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
      }
    ];

    for (const table of tables) {
      await new Promise<void>((resolve, reject) => {
        this.db.run(table.sql, (err) => {
          if (err) {
            console.error(`Error creating ${table.name} table:`, err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    console.log('Database tables initialized successfully');
  }

  // User operations
  async createUser(email: string, passwordHash: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        [email, passwordHash],
        function(this: sqlite3.RunResult, err: Error | null) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID as number);
          }
        }
      );
    });
  }

  async getUserByEmail(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async getUserById(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Subscription operations
  async getSubscriptions(userId: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT s.*, st.name, st.exchange 
         FROM subscriptions s 
         LEFT JOIN stocks st ON s.ticker = st.ticker 
         WHERE s.user_id = ?`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  async addSubscription(userId: number, ticker: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO subscriptions (user_id, ticker) VALUES (?, ?)',
        [userId, ticker],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async removeSubscription(userId: number, ticker: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM subscriptions WHERE user_id = ? AND ticker = ?',
        [userId, ticker],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getSubscriptionCount(userId: number): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) as count FROM subscriptions WHERE user_id = ?',
        [userId],
        (err, row: any) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });
  }

  // Stock operations
  async upsertStock(ticker: string, name: string, marketCap: number, exchange: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO stocks (ticker, name, market_cap, exchange, updated_at) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [ticker, name, marketCap, exchange],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async searchStocks(query: string, limit: number = 50): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM stocks 
         WHERE ticker LIKE ? OR name LIKE ? 
         ORDER BY market_cap DESC 
         LIMIT ?`,
        [`%${query}%`, `%${query}%`, limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  async getAllStocks(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM stocks ORDER BY market_cap DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // JWT token operations
  async saveToken(userId: number, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO jwt_tokens (user_id, token) VALUES (?, ?)',
        [userId, token],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async closeConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export default Database; 