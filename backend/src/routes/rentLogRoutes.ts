import { Router } from 'express';
import { RentLogController } from '../controllers/rentLogController';

const router = Router();

// Get all rent logs
router.get('/', RentLogController.getAllRentLogs);

// Get recent rent logs
router.get('/recent', RentLogController.getRecentRentLogs);

// Get current month rent logs
router.get('/current-month', RentLogController.getCurrentMonthRentLogs);

// Search rent logs
router.get('/search', RentLogController.searchRentLogs);

// Get rent logs by collector
router.get('/collector/:collector', RentLogController.getRentLogsByCollector);

// Get rent logs by tenant ID
router.get('/tenant/:tenantId', RentLogController.getRentLogsByTenantId);

// Get dashboard statistics
router.post('/dashboard-stats', RentLogController.getDashboardStats);

// Get monthly statistics
router.post('/monthly-stats', RentLogController.getMonthlyStats);

// Get rent logs by date range
router.post('/date-range', RentLogController.getRentLogsByDateRange);

// Create new rent log
router.post('/', RentLogController.createRentLog);

// Get rent log by ID
router.get('/:id', RentLogController.getRentLogById);

// Update rent log
router.put('/:id', RentLogController.updateRentLog);

// Delete rent log
router.delete('/:id', RentLogController.deleteRentLog);

export default router;
