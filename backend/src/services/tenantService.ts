import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../config/database';
import { Tenant, RentCollector, AppSettings, UploadedFile } from '../types';

export async function getTenants(userId: string): Promise<Tenant[]> {
  const rows = await dbAll('SELECT * FROM tenants WHERE userId = ? ORDER BY createdAt DESC', [userId]);
  return rows.map(parseTenant);
}

export async function getTenantById(userId: string, tenantId: string): Promise<Tenant | null> {
  const row = await dbGet('SELECT * FROM tenants WHERE id = ? AND userId = ?', [tenantId, userId]);
  return row ? parseTenant(row) : null;
}

export async function createTenant(userId: string, tenantData: Omit<Tenant, 'id' | 'userId' | 'createdAt'>): Promise<Tenant> {
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  
  await dbRun(
    `INSERT INTO tenants (id, userId, name, propertyName, monthlyRent, securityDeposit, startDate, 
       startMeterReading, propertyType, phoneNumber, notes, documents, isArchived, closingDate, 
       closingNotes, createdAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, userId, tenantData.name, tenantData.propertyName, tenantData.monthlyRent,
      tenantData.securityDeposit, tenantData.startDate, tenantData.startMeterReading,
      tenantData.propertyType, tenantData.phoneNumber || null, tenantData.notes || null,
      JSON.stringify(tenantData.documents), tenantData.isArchived ? 1 : 0,
      tenantData.closingDate || null, tenantData.closingNotes || null, createdAt
    ]
  );

  return getTenantById(userId, id) as Promise<Tenant>;
}

export async function updateTenant(userId: string, tenantId: string, tenantData: Partial<Tenant>): Promise<Tenant | null> {
  await dbRun(
    `UPDATE tenants SET 
       name = ?, propertyName = ?, monthlyRent = ?, securityDeposit = ?, startDate = ?,
       startMeterReading = ?, propertyType = ?, phoneNumber = ?, notes = ?, documents = ?,
       isArchived = ?, closingDate = ?, closingNotes = ?
     WHERE id = ? AND userId = ?`,
    [
      tenantData.name, tenantData.propertyName, tenantData.monthlyRent, tenantData.securityDeposit,
      tenantData.startDate, tenantData.startMeterReading, tenantData.propertyType,
      tenantData.phoneNumber || null, tenantData.notes || null, JSON.stringify(tenantData.documents),
      tenantData.isArchived ? 1 : 0, tenantData.closingDate || null, tenantData.closingNotes || null,
      tenantId, userId
    ]
  );

  return getTenantById(userId, tenantId);
}

export async function deleteTenant(userId: string, tenantId: string): Promise<boolean> {
  const result = await dbRun('DELETE FROM tenants WHERE id = ? AND userId = ?', [tenantId, userId]);
  return (result as any).changes > 0;
}

function parseTenant(row: any): Tenant {
  return {
    ...row,
    isArchived: Boolean(row.isArchived),
    documents: row.documents ? JSON.parse(row.documents) : [],
  };
}

// Rent Collectors
export async function getRentCollectors(userId: string): Promise<RentCollector[]> {
  return await dbAll('SELECT * FROM rentCollectors WHERE userId = ? ORDER BY createdAt DESC', [userId]);
}

export async function createRentCollector(userId: string, name: string): Promise<RentCollector> {
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  
  await dbRun('INSERT INTO rentCollectors (id, userId, name, createdAt) VALUES (?, ?, ?, ?)', [id, userId, name, createdAt]);
  
  return await dbGet('SELECT * FROM rentCollectors WHERE id = ?', [id]);
}

export async function deleteRentCollector(userId: string, collectorId: string): Promise<boolean> {
  const result = await dbRun('DELETE FROM rentCollectors WHERE id = ? AND userId = ?', [collectorId, userId]);
  return (result as any).changes > 0;
}

// Settings
export async function getSettings(userId: string): Promise<AppSettings | null> {
  return await dbGet('SELECT * FROM settings WHERE userId = ?', [userId]);
}

export async function updateSettings(userId: string, settings: Partial<AppSettings>): Promise<AppSettings | null> {
  await dbRun('UPDATE settings SET defaultUnitPrice = ? WHERE userId = ?', [settings.defaultUnitPrice, userId]);
  return getSettings(userId);
}

