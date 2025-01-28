const Database = require('better-sqlite3');
const config = require('./config');

const dbPath = config.get('database.db_path');
const db = new Database(dbPath);

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS coins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_address TEXT UNIQUE,
      name TEXT,
      symbol TEXT,
      creator_wallet TEXT,
      migration_time DATETIME,
      initial_liquidity REAL,
      creator_fee FLOAT,
      holders INTEGER,
      social_score FLOAT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_address TEXT,
      tx_hash TEXT UNIQUE,
      direction TEXT,
      amount_eth REAL,
      gas_price REAL,
      block_number INTEGER,
      timestamp DATETIME
    );
    CREATE TABLE IF NOT EXISTS twitter_metrics (
      coin_address TEXT PRIMARY KEY,
      twitter_handle TEXT,
      follower_count INTEGER,
      following_count INTEGER,
      sentiment_score REAL,
      post_frequency REAL,
      verified BOOLEAN,
      account_age_days INTEGER
    );
    CREATE TABLE IF NOT EXISTS twitter_posts (
      post_id TEXT PRIMARY KEY,
      coin_address TEXT,
      content TEXT,
      likes INTEGER,
      retweets INTEGER,
      timestamp DATETIME,
      sentiment REAL,
      hashtags TEXT,
      links TEXT
    );
    CREATE TABLE IF NOT EXISTS security_checks (
      contract_address TEXT PRIMARY KEY,
      rugcheck_score REAL,
      rugcheck_verdict TEXT,
      top_holder_percent REAL,
      is_bundled BOOLEAN,
      check_time DATETIME
    );
    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      direction TEXT,
      contract_address TEXT,
      amount REAL,
      tx_hash TEXT,
      profit REAL
    );
  `);
}

createTables();

module.exports = db;
