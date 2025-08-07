import { 
  Tenant, 
  RentLog, 
  RentCollector, 
  AppSettings, 
  UploadedFile, 
  ApiResponse, 
  DateRange,
  ArchiveTenantFormData 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/health');
  }

  // ===== TENANT ENDPOINTS =====
  
  async getAllTenants(): Promise<ApiResponse<Tenant[]>> {
    return this.request('/tenants');
  }

  async getActiveTenants(): Promise<ApiResponse<Tenant[]>> {
    return this.request('/tenants/active');
  }

  async getArchivedTenants(): Promise<ApiResponse<Tenant[]>> {
    return this.request('/tenants/archived');
  }

  async getTenantsWithPendingPayments(): Promise<ApiResponse<Tenant[]>> {
    return this.request('/tenants/pending-payments');
  }

  async searchTenants(query: string): Promise<ApiResponse<Tenant[]>> {
    return this.request(`/tenants/search?q=${encodeURIComponent(query)}`);
  }

  async getTenantById(id: string): Promise<ApiResponse<Tenant>> {
    return this.request(`/tenants/${id}`);
  }

  async createTenant(tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Tenant>> {
    return this.request('/tenants', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    });
  }

  async updateTenant(id: string, tenantData: Partial<Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<Tenant>> {
    return this.request(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tenantData),
    });
  }

  async deleteTenant(id: string): Promise<ApiResponse<null>> {
    return this.request(`/tenants/${id}`, {
      method: 'DELETE',
    });
  }

  async archiveTenant(id: string, formData: ArchiveTenantFormData): Promise<ApiResponse<Tenant>> {
    return this.request(`/tenants/${id}/archive`, {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  async unarchiveTenant(id: string): Promise<ApiResponse<Tenant>> {
    return this.request(`/tenants/${id}/unarchive`, {
      method: 'POST',
    });
  }

  // ===== RENT LOG ENDPOINTS =====
  
  async getAllRentLogs(): Promise<ApiResponse<RentLog[]>> {
    return this.request('/rent-logs');
  }

  async getRentLogById(id: string): Promise<ApiResponse<RentLog>> {
    return this.request(`/rent-logs/${id}`);
  }

  async createRentLog(rentLogData: Omit<RentLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<RentLog>> {
    return this.request('/rent-logs', {
      method: 'POST',
      body: JSON.stringify(rentLogData),
    });
  }

  async updateRentLog(id: string, rentLogData: Partial<Omit<RentLog, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<RentLog>> {
    return this.request(`/rent-logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rentLogData),
    });
  }

  async deleteRentLog(id: string): Promise<ApiResponse<null>> {
    return this.request(`/rent-logs/${id}`, {
      method: 'DELETE',
    });
  }

  async getRentLogsByTenantId(tenantId: string): Promise<ApiResponse<RentLog[]>> {
    return this.request(`/rent-logs/tenant/${tenantId}`);
  }

  async getRentLogsByDateRange(dateRange: DateRange): Promise<ApiResponse<RentLog[]>> {
    return this.request(`/rent-logs/date-range`, {
      method: 'POST',
      body: JSON.stringify(dateRange),
    });
  }

  async getRentLogsByCollector(collector: string): Promise<ApiResponse<RentLog[]>> {
    return this.request(`/rent-logs/collector/${encodeURIComponent(collector)}`);
  }

  async getRecentRentLogs(limit: number = 10): Promise<ApiResponse<RentLog[]>> {
    return this.request(`/rent-logs/recent?limit=${limit}`);
  }

  async getCurrentMonthRentLogs(): Promise<ApiResponse<RentLog[]>> {
    return this.request('/rent-logs/current-month');
  }

  async searchRentLogs(searchTerm: string): Promise<ApiResponse<RentLog[]>> {
    return this.request(`/rent-logs/search?q=${encodeURIComponent(searchTerm)}`);
  }

  async getDashboardStats(dateRange: DateRange): Promise<ApiResponse<{
    totalRentCollected: number;
    totalElectricityBill: number;
    totalLogs: number;
  }>> {
    return this.request('/rent-logs/dashboard-stats', {
      method: 'POST',
      body: JSON.stringify(dateRange),
    });
  }

  async getMonthlyStats(dateRange: DateRange): Promise<ApiResponse<Array<{
    month: string;
    rent: number;
    electricity: number;
  }>>> {
    return this.request('/rent-logs/monthly-stats', {
      method: 'POST',
      body: JSON.stringify(dateRange),
    });
  }

  // ===== RENT COLLECTOR ENDPOINTS =====
  
  async getAllRentCollectors(): Promise<ApiResponse<RentCollector[]>> {
    return this.request('/rent-collectors');
  }

  async getRentCollectorById(id: string): Promise<ApiResponse<RentCollector>> {
    return this.request(`/rent-collectors/${id}`);
  }

  async createRentCollector(collectorData: Omit<RentCollector, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<RentCollector>> {
    return this.request('/rent-collectors', {
      method: 'POST',
      body: JSON.stringify(collectorData),
    });
  }

  async updateRentCollector(id: string, collectorData: Partial<Omit<RentCollector, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<RentCollector>> {
    return this.request(`/rent-collectors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(collectorData),
    });
  }

  async deleteRentCollector(id: string): Promise<ApiResponse<null>> {
    return this.request(`/rent-collectors/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== APP SETTINGS ENDPOINTS =====
  
  async getAppSettings(): Promise<ApiResponse<AppSettings>> {
    return this.request('/settings');
  }

  async updateAppSettings(settingsData: Partial<Omit<AppSettings, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<AppSettings>> {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  }

  // ===== FILE UPLOAD ENDPOINTS =====
  
  async uploadFile(file: File, tenantId?: string, rentLogId?: string): Promise<ApiResponse<UploadedFile>> {
    const formData = new FormData();
    formData.append('file', file);
    if (tenantId) formData.append('tenantId', tenantId);
    if (rentLogId) formData.append('rentLogId', rentLogId);

    return this.request('/files/upload', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async getFilesByTenantId(tenantId: string): Promise<ApiResponse<UploadedFile[]>> {
    return this.request(`/files/tenant/${tenantId}`);
  }

  async getFilesByRentLogId(rentLogId: string): Promise<ApiResponse<UploadedFile[]>> {
    return this.request(`/files/rent-log/${rentLogId}`);
  }

  async deleteFile(id: string): Promise<ApiResponse<null>> {
    return this.request(`/files/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== DATA EXPORT/IMPORT ENDPOINTS =====
  
  async exportData(): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/export`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error('Failed to export data');
    }
    
    return response.blob();
  }

  async importData(file: File): Promise<ApiResponse<{ message: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/import', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async wipeAllData(): Promise<ApiResponse<{ message: string }>> {
    return this.request('/wipe-all-data', {
      method: 'DELETE',
    });
  }

  // ===== UTILITY METHODS =====
  
  async isConnected(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }

  getApiUrl(): string {
    return API_BASE_URL;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
