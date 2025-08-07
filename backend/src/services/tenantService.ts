import { db, convertTenantRow } from '../config/database';
import { Tenant, DatabaseTenant } from '../types';

export class TenantService {
  // Get all tenants
  static async getAllTenants(): Promise<Tenant[]> {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tenants ORDER BY created_at DESC', (err, rows: DatabaseTenant[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(convertTenantRow));
        }
      });
    });
  }

  // Get tenant by ID
  static async getTenantById(id: string): Promise<Tenant | null> {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM tenants WHERE id = ?', [id], (err, row: DatabaseTenant) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? convertTenantRow(row) : null);
        }
      });
    });
  }

  // Create new tenant
  static async createTenant(tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO tenants (
          id, name, property_name, monthly_rent, security_deposit, 
          start_date, start_meter_reading, property_type, phone_number, 
          notes, is_archived, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        tenantData.name,
        tenantData.propertyName,
        tenantData.monthlyRent,
        tenantData.securityDeposit,
        tenantData.startDate,
        tenantData.startMeterReading,
        tenantData.propertyType,
        tenantData.phoneNumber || null,
        tenantData.notes || null,
        tenantData.isArchived || false,
        now,
        now
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id,
            ...tenantData,
            createdAt: now,
            updatedAt: now
          });
        }
      });
    });
  }

  // Update tenant
  static async updateTenant(id: string, tenantData: Partial<Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Tenant | null> {
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      const updates: string[] = [];
      const values: any[] = [];
      
      if (tenantData.name !== undefined) {
        updates.push('name = ?');
        values.push(tenantData.name);
      }
      if (tenantData.propertyName !== undefined) {
        updates.push('property_name = ?');
        values.push(tenantData.propertyName);
      }
      if (tenantData.monthlyRent !== undefined) {
        updates.push('monthly_rent = ?');
        values.push(tenantData.monthlyRent);
      }
      if (tenantData.securityDeposit !== undefined) {
        updates.push('security_deposit = ?');
        values.push(tenantData.securityDeposit);
      }
      if (tenantData.startDate !== undefined) {
        updates.push('start_date = ?');
        values.push(tenantData.startDate);
      }
      if (tenantData.startMeterReading !== undefined) {
        updates.push('start_meter_reading = ?');
        values.push(tenantData.startMeterReading);
      }
      if (tenantData.propertyType !== undefined) {
        updates.push('property_type = ?');
        values.push(tenantData.propertyType);
      }
      if (tenantData.phoneNumber !== undefined) {
        updates.push('phone_number = ?');
        values.push(tenantData.phoneNumber);
      }
      if (tenantData.notes !== undefined) {
        updates.push('notes = ?');
        values.push(tenantData.notes);
      }
      if (tenantData.isArchived !== undefined) {
        updates.push('is_archived = ?');
        values.push(tenantData.isArchived);
      }
      if (tenantData.closingDate !== undefined) {
        updates.push('closing_date = ?');
        values.push(tenantData.closingDate);
      }
      if (tenantData.closingNotes !== undefined) {
        updates.push('closing_notes = ?');
        values.push(tenantData.closingNotes);
      }
      
      updates.push('updated_at = ?');
      values.push(now);
      values.push(id);
      
      const query = `UPDATE tenants SET ${updates.join(', ')} WHERE id = ?`;
      
      db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          // Get the updated tenant
          db.get('SELECT * FROM tenants WHERE id = ?', [id], (err, row: DatabaseTenant) => {
            if (err) {
              reject(err);
            } else {
              resolve(row ? convertTenantRow(row) : null);
            }
          });
        }
      });
    });
  }

  // Delete tenant
  static async deleteTenant(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM tenants WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // Archive tenant
  static async archiveTenant(id: string, closingDate: string, closingNotes: string): Promise<Tenant | null> {
    return this.updateTenant(id, {
      isArchived: true,
      closingDate,
      closingNotes
    });
  }

  // Unarchive tenant
  static async unarchiveTenant(id: string): Promise<Tenant | null> {
    return this.updateTenant(id, {
      isArchived: false,
      closingDate: undefined,
      closingNotes: undefined
    });
  }

  // Get active tenants
  static async getActiveTenants(): Promise<Tenant[]> {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tenants WHERE is_archived = 0 ORDER BY created_at DESC', (err, rows: DatabaseTenant[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(convertTenantRow));
        }
      });
    });
  }

  // Get archived tenants
  static async getArchivedTenants(): Promise<Tenant[]> {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tenants WHERE is_archived = 1 ORDER BY closing_date DESC', (err, rows: DatabaseTenant[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(convertTenantRow));
        }
      });
    });
  }

  // Search tenants
  static async searchTenants(searchTerm: string): Promise<Tenant[]> {
    return new Promise((resolve, reject) => {
      const searchPattern = `%${searchTerm}%`;
      db.all(`
        SELECT * FROM tenants 
        WHERE (name LIKE ? OR property_name LIKE ?) 
        ORDER BY created_at DESC
      `, [searchPattern, searchPattern], (err, rows: DatabaseTenant[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(convertTenantRow));
        }
      });
    });
  }

  // Get tenants with pending payments (no rent log for current month)
  static async getTenantsWithPendingPayments(): Promise<Tenant[]> {
    return new Promise((resolve, reject) => {
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      db.all(`
        SELECT t.* FROM tenants t
        WHERE t.is_archived = 0
        AND NOT EXISTS (
          SELECT 1 FROM rent_logs r 
          WHERE r.tenant_id = t.id 
          AND r.date LIKE '${currentMonth}%'
        )
        ORDER BY t.name
      `, (err, rows: DatabaseTenant[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(convertTenantRow));
        }
      });
    });
  }
}
