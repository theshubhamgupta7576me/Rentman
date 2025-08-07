import { Request, Response } from 'express';
import { RentLogService } from '../services/rentLogService';
import { ApiResponse, RentLog, DateRange } from '../types';

export class RentLogController {
  // Get all rent logs
  static async getAllRentLogs(req: Request, res: Response) {
    try {
      const rentLogs = await RentLogService.getAllRentLogs();
      const response: ApiResponse<RentLog[]> = {
        success: true,
        data: rentLogs
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting all rent logs:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get rent logs'
      };
      res.status(500).json(response);
    }
  }

  // Get rent log by ID
  static async getRentLogById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const rentLog = await RentLogService.getRentLogById(id);
      
      if (!rentLog) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Rent log not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<RentLog> = {
        success: true,
        data: rentLog
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting rent log by ID:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get rent log'
      };
      res.status(500).json(response);
    }
  }

  // Create new rent log
  static async createRentLog(req: Request, res: Response) {
    try {
      const rentLogData = req.body;
      
      // Validate required fields
      const requiredFields = [
        'tenantId', 'tenantName', 'date', 'rentPaid', 
        'previousMeterReading', 'currentMeterReading', 'units', 
        'unitPrice', 'meterBill', 'total', 'collector', 'paymentMode'
      ];
      
      for (const field of requiredFields) {
        if (!rentLogData[field]) {
          const response: ApiResponse<null> = {
            success: false,
            error: `Missing required field: ${field}`
          };
          return res.status(400).json(response);
        }
      }

      const rentLog = await RentLogService.createRentLog(rentLogData);
      const response: ApiResponse<RentLog> = {
        success: true,
        data: rentLog,
        message: 'Rent log created successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating rent log:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to create rent log'
      };
      res.status(500).json(response);
    }
  }

  // Update rent log
  static async updateRentLog(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const rentLogData = req.body;
      
      const rentLog = await RentLogService.updateRentLog(id, rentLogData);
      
      if (!rentLog) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Rent log not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<RentLog> = {
        success: true,
        data: rentLog,
        message: 'Rent log updated successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error updating rent log:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to update rent log'
      };
      res.status(500).json(response);
    }
  }

  // Delete rent log
  static async deleteRentLog(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await RentLogService.deleteRentLog(id);
      
      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Rent log not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Rent log deleted successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error deleting rent log:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to delete rent log'
      };
      res.status(500).json(response);
    }
  }

  // Get rent logs by tenant ID
  static async getRentLogsByTenantId(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;
      const rentLogs = await RentLogService.getRentLogsByTenantId(tenantId);
      const response: ApiResponse<RentLog[]> = {
        success: true,
        data: rentLogs
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting rent logs by tenant ID:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get rent logs'
      };
      res.status(500).json(response);
    }
  }

  // Get rent logs by date range
  static async getRentLogsByDateRange(req: Request, res: Response) {
    try {
      const dateRange: DateRange = req.body;
      
      if (!dateRange.start || !dateRange.end) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Start and end dates are required'
        };
        return res.status(400).json(response);
      }

      const rentLogs = await RentLogService.getRentLogsByDateRange(dateRange);
      const response: ApiResponse<RentLog[]> = {
        success: true,
        data: rentLogs
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting rent logs by date range:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get rent logs'
      };
      res.status(500).json(response);
    }
  }

  // Get rent logs by collector
  static async getRentLogsByCollector(req: Request, res: Response) {
    try {
      const { collector } = req.params;
      const rentLogs = await RentLogService.getRentLogsByCollector(collector);
      const response: ApiResponse<RentLog[]> = {
        success: true,
        data: rentLogs
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting rent logs by collector:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get rent logs'
      };
      res.status(500).json(response);
    }
  }

  // Get recent rent logs
  static async getRecentRentLogs(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const rentLogs = await RentLogService.getRecentRentLogs(limit);
      const response: ApiResponse<RentLog[]> = {
        success: true,
        data: rentLogs
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting recent rent logs:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get recent rent logs'
      };
      res.status(500).json(response);
    }
  }

  // Get current month rent logs
  static async getCurrentMonthRentLogs(req: Request, res: Response) {
    try {
      const rentLogs = await RentLogService.getCurrentMonthRentLogs();
      const response: ApiResponse<RentLog[]> = {
        success: true,
        data: rentLogs
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting current month rent logs:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get current month rent logs'
      };
      res.status(500).json(response);
    }
  }

  // Search rent logs
  static async searchRentLogs(req: Request, res: Response) {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Search query is required'
        };
        return res.status(400).json(response);
      }

      const rentLogs = await RentLogService.searchRentLogs(q);
      const response: ApiResponse<RentLog[]> = {
        success: true,
        data: rentLogs
      };
      res.json(response);
    } catch (error) {
      console.error('Error searching rent logs:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to search rent logs'
      };
      res.status(500).json(response);
    }
  }

  // Get dashboard statistics
  static async getDashboardStats(req: Request, res: Response) {
    try {
      const dateRange: DateRange = req.body;
      
      if (!dateRange.start || !dateRange.end) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Start and end dates are required'
        };
        return res.status(400).json(response);
      }

      const stats = await RentLogService.getDashboardStats(dateRange);
      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get dashboard stats'
      };
      res.status(500).json(response);
    }
  }

  // Get monthly statistics
  static async getMonthlyStats(req: Request, res: Response) {
    try {
      const dateRange: DateRange = req.body;
      
      if (!dateRange.start || !dateRange.end) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Start and end dates are required'
        };
        return res.status(400).json(response);
      }

      const stats = await RentLogService.getMonthlyStats(dateRange);
      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting monthly stats:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get monthly stats'
      };
      res.status(500).json(response);
    }
  }
}
