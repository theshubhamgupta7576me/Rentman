import { db, convertRentLogRow } from '../config/database';
import { RentLog, DatabaseRentLog, DateRange } from '../types';

export class RentLogService {
  // Get all rent logs
  static async getAllRentLogs(): Promise<RentLog[]> {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM rent_logs ORDER BY date DESC, created_at DESC', (err, rows: DatabaseRentLog[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(convertRentLogRow));
        }
      });
    });
  }

  // Get rent log by ID
  static async getRentLogById(id: string): Promise<RentLog | null> {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM rent_logs WHERE id = ?', [id], (err, row: DatabaseRentLog) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? convertRentLogRow(row) : null);
        }
      });
    });
  }

  // Create new rent log
  static async createRentLog(rentLogData: Omit<RentLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<RentLog> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO rent_logs (
          id, tenant_id, tenant_name, date, rent_paid, 
          previous_meter_reading, current_meter_reading, units, 
          unit_price, meter_bill, total, collector, 
          payment_mode, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        rentLogData.tenantId,
        rentLogData.tenantName,
        rentLogData.date,
        rentLogData.rentPaid,
        rentLogData.previousMeterReading,
        rentLogData.currentMeterReading,
        rentLogData.units,
        rentLogData.unitPrice,
        rentLogData.meterBill,
        rentLogData.total,
        rentLogData.collector,
        rentLogData.paymentMode,
        rentLogData.notes,
        now,
        now
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id,
            ...rentLogData,
            createdAt: now,
            updatedAt: now
          });
        }
      });
    });
  }

  // Update rent log
  static async updateRentLog(id: string, rentLogData: Partial<Omit<RentLog, 'id' | 'createdAt' | 'updatedAt'>>): Promise<RentLog | null> {
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      const updates: string[] = [];
      const values: any[] = [];
      
      if (rentLogData.tenantId !== undefined) {
        updates.push('tenant_id = ?');
        values.push(rentLogData.tenantId);
      }
      if (rentLogData.tenantName !== undefined) {
        updates.push('tenant_name = ?');
        values.push(rentLogData.tenantName);
      }
      if (rentLogData.date !== undefined) {
        updates.push('date = ?');
        values.push(rentLogData.date);
      }
      if (rentLogData.rentPaid !== undefined) {
        updates.push('rent_paid = ?');
        values.push(rentLogData.rentPaid);
      }
      if (rentLogData.previousMeterReading !== undefined) {
        updates.push('previous_meter_reading = ?');
        values.push(rentLogData.previousMeterReading);
      }
      if (rentLogData.currentMeterReading !== undefined) {
        updates.push('current_meter_reading = ?');
        values.push(rentLogData.currentMeterReading);
      }
      if (rentLogData.units !== undefined) {
        updates.push('units = ?');
        values.push(rentLogData.units);
      }
      if (rentLogData.unitPrice !== undefined) {
        updates.push('unit_price = ?');
        values.push(rentLogData.unitPrice);
      }
      if (rentLogData.meterBill !== undefined) {
        updates.push('meter_bill = ?');
        values.push(rentLogData.meterBill);
      }
      if (rentLogData.total !== undefined) {
        updates.push('total = ?');
        values.push(rentLogData.total);
      }
      if (rentLogData.collector !== undefined) {
        updates.push('collector = ?');
        values.push(rentLogData.collector);
      }
      if (rentLogData.paymentMode !== undefined) {
        updates.push('payment_mode = ?');
        values.push(rentLogData.paymentMode);
      }
      if (rentLogData.notes !== undefined) {
        updates.push('notes = ?');
        values.push(rentLogData.notes);
      }
      
      updates.push('updated_at = ?');
      values.push(now);
      values.push(id);
      
      const query = `UPDATE rent_logs SET ${updates.join(', ')} WHERE id = ?`;
      
      db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          // Get the updated rent log
          db.get('SELECT * FROM rent_logs WHERE id = ?', [id], (err, row: DatabaseRentLog) => {
            if (err) {
              reject(err);
            } else {
              resolve(row ? convertRentLogRow(row) : null);
            }
          });
        }
      });
    });
  }

  // Delete rent log
  static async deleteRentLog(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM rent_logs WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // Get rent logs by tenant ID
  static async getRentLogsByTenantId(tenantId: string): Promise<RentLog[]> {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM rent_logs WHERE tenant_id = ? ORDER BY date DESC', [tenantId], (err, rows: DatabaseRentLog[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(convertRentLogRow));
        }
      });
    });
  }

  // Get rent logs by date range
  static async getRentLogsByDateRange(dateRange: DateRange): Promise<RentLog[]> {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM rent_logs WHERE date BETWEEN ? AND ? ORDER BY date DESC', 
        [dateRange.start, dateRange.end], (err, rows: DatabaseRentLog[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(convertRentLogRow));
        }
      });
    });
  }

  // Get rent logs by collector
  static async getRentLogsByCollector(collector: string): Promise<RentLog[]> {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM rent_logs WHERE collector = ? ORDER BY date DESC', [collector], (err, rows: DatabaseRentLog[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(convertRentLogRow));
        }
      });
    });
  }

  // Get recent rent logs (last 10)
  static async getRecentRentLogs(limit: number = 10): Promise<RentLog[]> {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM rent_logs ORDER BY created_at DESC LIMIT ?', [limit], (err, rows: DatabaseRentLog[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(convertRentLogRow));
        }
      });
    });
  }

  // Get rent logs for current month
  static async getCurrentMonthRentLogs(): Promise<RentLog[]> {
    return new Promise((resolve, reject) => {
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      db.all('SELECT * FROM rent_logs WHERE date LIKE ? ORDER BY date DESC', 
        [`${currentMonth}%`], (err, rows: DatabaseRentLog[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(convertRentLogRow));
        }
      });
    });
  }

  // Search rent logs
  static async searchRentLogs(searchTerm: string): Promise<RentLog[]> {
    return new Promise((resolve, reject) => {
      const searchPattern = `%${searchTerm}%`;
      db.all(`
        SELECT * FROM rent_logs 
        WHERE (tenant_name LIKE ? OR collector LIKE ? OR notes LIKE ?) 
        ORDER BY date DESC
      `, [searchPattern, searchPattern, searchPattern], (err, rows: DatabaseRentLog[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(convertRentLogRow));
        }
      });
    });
  }

  // Get dashboard statistics
  static async getDashboardStats(dateRange: DateRange): Promise<{
    totalRentCollected: number;
    totalElectricityBill: number;
    totalLogs: number;
  }> {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          SUM(rent_paid) as totalRentCollected,
          SUM(meter_bill) as totalElectricityBill,
          COUNT(*) as totalLogs
        FROM rent_logs 
        WHERE date BETWEEN ? AND ?
      `, [dateRange.start, dateRange.end], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            totalRentCollected: row.totalRentCollected || 0,
            totalElectricityBill: row.totalElectricityBill || 0,
            totalLogs: row.totalLogs || 0
          });
        }
      });
    });
  }

  // Get monthly statistics for charts
  static async getMonthlyStats(dateRange: DateRange): Promise<Array<{
    month: string;
    rent: number;
    electricity: number;
  }>> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          strftime('%Y-%m', date) as month,
          SUM(rent_paid) as rent,
          SUM(meter_bill) as electricity
        FROM rent_logs 
        WHERE date BETWEEN ? AND ?
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month
      `, [dateRange.start, dateRange.end], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => ({
            month: row.month,
            rent: row.rent || 0,
            electricity: row.electricity || 0
          })));
        }
      });
    });
  }
}
