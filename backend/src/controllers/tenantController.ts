import { Request, Response } from 'express';
import { TenantService } from '../services/tenantService';
import { ApiResponse, Tenant } from '../types';

export class TenantController {
  // Get all tenants
  static async getAllTenants(req: Request, res: Response) {
    try {
      const tenants = await TenantService.getAllTenants();
      const response: ApiResponse<Tenant[]> = {
        success: true,
        data: tenants
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting all tenants:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get tenants'
      };
      res.status(500).json(response);
    }
  }

  // Get tenant by ID
  static async getTenantById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenant = await TenantService.getTenantById(id);
      
      if (!tenant) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Tenant not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<Tenant> = {
        success: true,
        data: tenant
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting tenant by ID:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get tenant'
      };
      res.status(500).json(response);
    }
  }

  // Create new tenant
  static async createTenant(req: Request, res: Response) {
    try {
      const tenantData = req.body;
      
      // Validate required fields
      const requiredFields = ['name', 'propertyName', 'monthlyRent', 'securityDeposit', 'startDate', 'startMeterReading', 'propertyType'];
      for (const field of requiredFields) {
        if (!tenantData[field]) {
          const response: ApiResponse<null> = {
            success: false,
            error: `Missing required field: ${field}`
          };
          return res.status(400).json(response);
        }
      }

      const tenant = await TenantService.createTenant(tenantData);
      const response: ApiResponse<Tenant> = {
        success: true,
        data: tenant,
        message: 'Tenant created successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating tenant:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to create tenant'
      };
      res.status(500).json(response);
    }
  }

  // Update tenant
  static async updateTenant(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantData = req.body;
      
      const tenant = await TenantService.updateTenant(id, tenantData);
      
      if (!tenant) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Tenant not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<Tenant> = {
        success: true,
        data: tenant,
        message: 'Tenant updated successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error updating tenant:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to update tenant'
      };
      res.status(500).json(response);
    }
  }

  // Delete tenant
  static async deleteTenant(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await TenantService.deleteTenant(id);
      
      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Tenant not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Tenant deleted successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error deleting tenant:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to delete tenant'
      };
      res.status(500).json(response);
    }
  }

  // Archive tenant
  static async archiveTenant(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { closingDate, closingNotes } = req.body;
      
      if (!closingDate) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Closing date is required'
        };
        return res.status(400).json(response);
      }

      const tenant = await TenantService.archiveTenant(id, closingDate, closingNotes || '');
      
      if (!tenant) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Tenant not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<Tenant> = {
        success: true,
        data: tenant,
        message: 'Tenant archived successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error archiving tenant:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to archive tenant'
      };
      res.status(500).json(response);
    }
  }

  // Unarchive tenant
  static async unarchiveTenant(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenant = await TenantService.unarchiveTenant(id);
      
      if (!tenant) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Tenant not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<Tenant> = {
        success: true,
        data: tenant,
        message: 'Tenant unarchived successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error unarchiving tenant:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to unarchive tenant'
      };
      res.status(500).json(response);
    }
  }

  // Get active tenants
  static async getActiveTenants(req: Request, res: Response) {
    try {
      const tenants = await TenantService.getActiveTenants();
      const response: ApiResponse<Tenant[]> = {
        success: true,
        data: tenants
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting active tenants:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get active tenants'
      };
      res.status(500).json(response);
    }
  }

  // Get archived tenants
  static async getArchivedTenants(req: Request, res: Response) {
    try {
      const tenants = await TenantService.getArchivedTenants();
      const response: ApiResponse<Tenant[]> = {
        success: true,
        data: tenants
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting archived tenants:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get archived tenants'
      };
      res.status(500).json(response);
    }
  }

  // Search tenants
  static async searchTenants(req: Request, res: Response) {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Search query is required'
        };
        return res.status(400).json(response);
      }

      const tenants = await TenantService.searchTenants(q);
      const response: ApiResponse<Tenant[]> = {
        success: true,
        data: tenants
      };
      res.json(response);
    } catch (error) {
      console.error('Error searching tenants:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to search tenants'
      };
      res.status(500).json(response);
    }
  }

  // Get tenants with pending payments
  static async getTenantsWithPendingPayments(req: Request, res: Response) {
    try {
      const tenants = await TenantService.getTenantsWithPendingPayments();
      const response: ApiResponse<Tenant[]> = {
        success: true,
        data: tenants
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting tenants with pending payments:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get tenants with pending payments'
      };
      res.status(500).json(response);
    }
  }
}
