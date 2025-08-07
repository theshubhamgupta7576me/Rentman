import sqlite3 from 'sqlite3';
import path from 'path';
import { DatabaseTenant, DatabaseRentLog, DatabaseRentCollector, DatabaseAppSettings, DatabaseUploadedFile } from '../types';

const dbPath = path.join(__dirname, '../../data/rentman.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create tables
  db.serialize(() => {
    // Tenants table
    db.run(`
      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        property_name TEXT NOT NULL,
        monthly_rent REAL NOT NULL,
        security_deposit REAL NOT NULL,
        start_date TEXT NOT NULL,
        start_meter_reading TEXT NOT NULL,
        property_type TEXT CHECK(property_type IN ('residential', 'commercial')) NOT NULL,
        phone_number TEXT,
        notes TEXT,
        is_archived BOOLEAN DEFAULT 0,
        closing_date TEXT,
        closing_notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Rent logs table
    db.run(`
      CREATE TABLE IF NOT EXISTS rent_logs (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        tenant_name TEXT NOT NULL,
        date TEXT NOT NULL,
        rent_paid REAL NOT NULL,
        previous_meter_reading REAL NOT NULL,
        current_meter_reading REAL NOT NULL,
        units REAL NOT NULL,
        unit_price REAL NOT NULL,
        meter_bill REAL NOT NULL,
        total REAL NOT NULL,
        collector TEXT NOT NULL,
        payment_mode TEXT CHECK(payment_mode IN ('online', 'cash')) NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
      )
    `);

    // Rent collectors table
    db.run(`
      CREATE TABLE IF NOT EXISTS rent_collectors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // App settings table
    db.run(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id TEXT PRIMARY KEY,
        default_unit_price REAL NOT NULL DEFAULT 8,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Uploaded files table
    db.run(`
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        size REAL NOT NULL,
        data TEXT NOT NULL,
        uploaded_at TEXT NOT NULL,
        tenant_id TEXT,
        rent_log_id TEXT,
        FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
        FOREIGN KEY (rent_log_id) REFERENCES rent_logs (id) ON DELETE CASCADE
      )
    `);

    // Insert default settings if not exists
    db.get('SELECT COUNT(*) as count FROM app_settings', (err, row: any) => {
      if (err) {
        console.error('Error checking app settings:', err);
        return;
      }
      
      if (row.count === 0) {
        const now = new Date().toISOString();
        db.run(`
          INSERT INTO app_settings (id, default_unit_price, created_at, updated_at)
          VALUES (?, ?, ?, ?)
        `, [crypto.randomUUID(), 8, now, now]);
      }
    });

    // Insert default collectors if not exists
    db.get('SELECT COUNT(*) as count FROM rent_collectors', (err, row: any) => {
      if (err) {
        console.error('Error checking rent collectors:', err);
        return;
      }
      
      if (row.count === 0) {
        const now = new Date().toISOString();
        const defaultCollectors = [
          { name: 'John Doe' },
          { name: 'Jane Smith' },
          { name: 'Mike Johnson' },
          { name: 'Sarah Wilson' }
        ];
        
        defaultCollectors.forEach(collector => {
          db.run(`
            INSERT INTO rent_collectors (id, name, created_at, updated_at)
            VALUES (?, ?, ?, ?)
          `, [crypto.randomUUID(), collector.name, now, now]);
        });
      }
    });

    console.log('Database initialized successfully');
  });
}

// Helper function to convert database row to API object
export function convertTenantRow(row: DatabaseTenant) {
  return {
    id: row.id,
    name: row.name,
    propertyName: row.property_name,
    monthlyRent: row.monthly_rent,
    securityDeposit: row.security_deposit,
    startDate: row.start_date,
    startMeterReading: row.start_meter_reading,
    propertyType: row.property_type,
    phoneNumber: row.phone_number,
    notes: row.notes,
    isArchived: row.is_archived,
    closingDate: row.closing_date,
    closingNotes: row.closing_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function convertRentLogRow(row: DatabaseRentLog) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    tenantName: row.tenant_name,
    date: row.date,
    rentPaid: row.rent_paid,
    previousMeterReading: row.previous_meter_reading,
    currentMeterReading: row.current_meter_reading,
    units: row.units,
    unitPrice: row.unit_price,
    meterBill: row.meter_bill,
    total: row.total,
    collector: row.collector,
    paymentMode: row.payment_mode,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function convertRentCollectorRow(row: DatabaseRentCollector) {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function convertAppSettingsRow(row: DatabaseAppSettings) {
  return {
    id: row.id,
    defaultUnitPrice: row.default_unit_price,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function convertUploadedFileRow(row: DatabaseUploadedFile) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    size: row.size,
    data: row.data,
    uploadedAt: row.uploaded_at,
    tenantId: row.tenant_id,
    rentLogId: row.rent_log_id
  };
}
