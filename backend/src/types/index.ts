export interface User {
  id: string;
  email?: string;
  phoneNumber?: string;
  password: string;
  createdAt: string;
}

export interface Tenant {
  id: string;
  userId: string;
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
  userId: string;
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
  userId: string;
  name: string;
  createdAt: string;
}

export interface AppSettings {
  userId: string;
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

export interface RegisterRequest {
  email?: string;
  phoneNumber?: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginRequest {
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email?: string;
    phoneNumber?: string;
  };
  token?: string;
  message?: string;
}

