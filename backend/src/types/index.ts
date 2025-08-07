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
  isArchived?: boolean;
  closingDate?: string;
  closingNotes?: string;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface RentCollector {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  id: string;
  defaultUnitPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded data
  uploadedAt: string;
  tenantId?: string;
  rentLogId?: string;
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

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Database types
export interface DatabaseTenant {
  id: string;
  name: string;
  property_name: string;
  monthly_rent: number;
  security_deposit: number;
  start_date: string;
  start_meter_reading: string;
  property_type: 'residential' | 'commercial';
  phone_number?: string;
  notes?: string;
  is_archived: boolean;
  closing_date?: string;
  closing_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseRentLog {
  id: string;
  tenant_id: string;
  tenant_name: string;
  date: string;
  rent_paid: number;
  previous_meter_reading: number;
  current_meter_reading: number;
  units: number;
  unit_price: number;
  meter_bill: number;
  total: number;
  collector: string;
  payment_mode: 'online' | 'cash';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseRentCollector {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAppSettings {
  id: string;
  default_unit_price: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string;
  uploaded_at: string;
  tenant_id?: string;
  rent_log_id?: string;
}
