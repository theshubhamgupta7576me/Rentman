import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import * as tenantService from '../services/tenantService';

const router = express.Router();

router.use(authenticateToken);

// Get all tenants
router.get('/', async (req: AuthRequest, res) => {
  try {
    const tenants = await tenantService.getTenants(req.userId!);
    res.json({ success: true, data: tenants });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tenants' });
  }
});

// Get tenant by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const tenant = await tenantService.getTenantById(req.userId!, req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }
    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tenant' });
  }
});

// Create tenant
router.post('/', async (req: AuthRequest, res) => {
  try {
    const tenant = await tenantService.createTenant(req.userId!, req.body);
    res.status(201).json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create tenant' });
  }
});

// Update tenant
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const tenant = await tenantService.updateTenant(req.userId!, req.params.id, req.body);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }
    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update tenant' });
  }
});

// Delete tenant
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const deleted = await tenantService.deleteTenant(req.userId!, req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }
    res.json({ success: true, message: 'Tenant deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete tenant' });
  }
});

// Rent Collectors routes
router.get('/collectors/list', async (req: AuthRequest, res) => {
  try {
    const collectors = await tenantService.getRentCollectors(req.userId!);
    res.json({ success: true, data: collectors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch collectors' });
  }
});

router.post('/collectors', async (req: AuthRequest, res) => {
  try {
    const collector = await tenantService.createRentCollector(req.userId!, req.body.name);
    res.status(201).json({ success: true, data: collector });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create collector' });
  }
});

router.delete('/collectors/:id', async (req: AuthRequest, res) => {
  try {
    const deleted = await tenantService.deleteRentCollector(req.userId!, req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Collector not found' });
    }
    res.json({ success: true, message: 'Collector deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete collector' });
  }
});

// Settings routes
router.get('/settings/get', async (req: AuthRequest, res) => {
  try {
    const settings = await tenantService.getSettings(req.userId!);
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

router.put('/settings/update', async (req: AuthRequest, res) => {
  try {
    const settings = await tenantService.updateSettings(req.userId!, req.body);
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

export default router;

