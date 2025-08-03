export interface Tenant {
  id: string;
  name: string;
  propertyName: string;
  monthlyRent: number;
  securityDeposit: number;
  startDate: string;
  startMeterReading: string;
  propertyType: 'residential' | 'commercial';
  phoneNumber?: string;
  notes?: string;
  documents: UploadedFile[];
  isArchived?: boolean;
  closingDate?: string;
  closingNotes?: string;
  createdAt: string;
}

export interface RentLog {
  id: string;
  tenantId: string;
  tenantName: string;
  date: string;
  rentPaid: number;
  previousMeterReading: number;
  currentMeterReading: number;
  units: number;
  unitPrice: number;
  meterBill: number;
  total: number;
  collector: string;
  paymentMode: 'online' | 'cash';
  notes: string;
  attachments: UploadedFile[];
  createdAt: string;
}

export interface RentCollector {
  id: string;
  name: string;
  createdAt: string;
}

export interface AppSettings {
  defaultUnitPrice: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded data
  uploadedAt: string;
}

export interface DashboardStats {
  totalRentCollected: number;
  totalElectricityBill: number;
  tenantsWithDues: number;
  totalTenants: number;
}

export type DateFilter = '30days' | '6months' | '1year' | 'custom';

export interface DateRange {
  start: string;
  end: string;
}

export interface ArchiveTenantFormData {
  closingDate: string;
  closingNotes: string;
}

export interface TenantFinancialSummary {
  totalRentPaid: number;
  totalElectricityBill: number;
  totalAmountPaid: number;
  totalMonthsOccupied: number;
}