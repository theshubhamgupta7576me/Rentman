import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import * as rentLogService from '../services/rentLogService';

const router = express.Router();

router.use(authenticateToken);

// Get all rent logs
router.get('/', async (req: AuthRequest, res) => {
  try {
    const logs = await rentLogService.getRentLogs(req.userId!);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch rent logs' });
  }
});

// Get rent log by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const log = await rentLogService.getRentLogById(req.userId!, req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Rent log not found' });
    }
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch rent log' });
  }
});

// Create rent log
router.post('/', async (req: AuthRequest, res) => {
  try {
    const log = await rentLogService.createRentLog(req.userId!, req.body);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create rent log' });
  }
});

// Update rent log
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const log = await rentLogService.updateRentLog(req.userId!, req.params.id, req.body);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Rent log not found' });
    }
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update rent log' });
  }
});

// Delete rent log
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const deleted = await rentLogService.deleteRentLog(req.userId!, req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Rent log not found' });
    }
    res.json({ success: true, message: 'Rent log deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete rent log' });
  }
});

export default router;

