import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'backend/data/rentman.db');

// Create data directory if it doesn't exist
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Promisify database methods with proper typing
export function dbRun(sql: string, params?: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    db.run(sql, params || [], function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

export function dbGet(sql: string, params?: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(sql, params || [], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function dbAll(sql: string, params?: any[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params || [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        phoneNumber TEXT UNIQUE,
        password TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);

    // Tenants table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        propertyName TEXT NOT NULL,
        monthlyRent REAL NOT NULL,
        securityDeposit REAL NOT NULL,
        startDate TEXT NOT NULL,
        startMeterReading TEXT NOT NULL,
        propertyType TEXT NOT NULL,
        phoneNumber TEXT,
        notes TEXT,
        documents TEXT,
        isArchived INTEGER DEFAULT 0,
        closingDate TEXT,
        closingNotes TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Rent logs table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS rentLogs (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        tenantId TEXT NOT NULL,
        tenantName TEXT NOT NULL,
        date TEXT NOT NULL,
        rentPaid REAL NOT NULL,
        previousMeterReading INTEGER NOT NULL,
        currentMeterReading INTEGER NOT NULL,
        units INTEGER NOT NULL,
        unitPrice REAL NOT NULL,
        meterBill REAL NOT NULL,
        total REAL NOT NULL,
        collector TEXT NOT NULL,
        paymentMode TEXT NOT NULL,
        notes TEXT,
        attachments TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (tenantId) REFERENCES tenants(id)
      )
    `);

    // Rent collectors table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS rentCollectors (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Settings table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS settings (
        userId TEXT PRIMARY KEY,
        defaultUnitPrice REAL NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Create indexes for better performance
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_tenants_userId ON tenants(userId)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_rentLogs_userId ON rentLogs(userId)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_rentCollectors_userId ON rentCollectors(userId)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_rentLogs_tenantId ON rentLogs(tenantId)`);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export default db;

