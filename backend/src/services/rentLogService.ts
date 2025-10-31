import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../config/database';
import { RentLog } from '../types';

export async function getRentLogs(userId: string): Promise<RentLog[]> {
  const rows = await dbAll('SELECT * FROM rentLogs WHERE userId = ? ORDER BY date DESC', [userId]);
  return rows.map(parseRentLog);
}

export async function getRentLogById(userId: string, logId: string): Promise<RentLog | null> {
  const row = await dbGet('SELECT * FROM rentLogs WHERE id = ? AND userId = ?', [logId, userId]);
  return row ? parseRentLog(row) : null;
}

export async function createRentLog(userId: string, logData: Omit<RentLog, 'id' | 'userId' | 'createdAt'>): Promise<RentLog> {
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  
  await dbRun(
    `INSERT INTO rentLogs (id, userId, tenantId, tenantName, date, rentPaid, previousMeterReading,
       currentMeterReading, units, unitPrice, meterBill, total, collector, paymentMode, notes,
       attachments, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, userId, logData.tenantId, logData.tenantName, logData.date, logData.rentPaid,
      logData.previousMeterReading, logData.currentMeterReading, logData.units, logData.unitPrice,
      logData.meterBill, logData.total, logData.collector, logData.paymentMode, logData.notes || '',
      JSON.stringify(logData.attachments), createdAt
    ]
  );

  return getRentLogById(userId, id) as Promise<RentLog>;
}

export async function updateRentLog(userId: string, logId: string, logData: Partial<RentLog>): Promise<RentLog | null> {
  await dbRun(
    `UPDATE rentLogs SET 
       tenantId = ?, tenantName = ?, date = ?, rentPaid = ?, previousMeterReading = ?,
       currentMeterReading = ?, units = ?, unitPrice = ?, meterBill = ?, total = ?,
       collector = ?, paymentMode = ?, notes = ?, attachments = ?
     WHERE id = ? AND userId = ?`,
    [
      logData.tenantId, logData.tenantName, logData.date, logData.rentPaid,
      logData.previousMeterReading, logData.currentMeterReading, logData.units, logData.unitPrice,
      logData.meterBill, logData.total, logData.collector, logData.paymentMode, logData.notes || '',
      JSON.stringify(logData.attachments), logId, userId
    ]
  );

  return getRentLogById(userId, logId);
}

export async function deleteRentLog(userId: string, logId: string): Promise<boolean> {
  const result = await dbRun('DELETE FROM rentLogs WHERE id = ? AND userId = ?', [logId, userId]);
  return (result as any).changes > 0;
}

function parseRentLog(row: any): RentLog {
  return {
    ...row,
    attachments: row.attachments ? JSON.parse(row.attachments) : [],
  };
}

