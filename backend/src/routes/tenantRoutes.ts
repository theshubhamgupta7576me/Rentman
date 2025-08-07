import { Router } from 'express';
import { TenantController } from '../controllers/tenantController';

const router = Router();

// Get all tenants
router.get('/', TenantController.getAllTenants);

// Get active tenants
router.get('/active', TenantController.getActiveTenants);

// Get archived tenants
router.get('/archived', TenantController.getArchivedTenants);

// Get tenants with pending payments
router.get('/pending-payments', TenantController.getTenantsWithPendingPayments);

// Search tenants
router.get('/search', TenantController.searchTenants);

// Create new tenant
router.post('/', TenantController.createTenant);

// Archive tenant
router.post('/:id/archive', TenantController.archiveTenant);

// Unarchive tenant
router.post('/:id/unarchive', TenantController.unarchiveTenant);

// Get tenant by ID
router.get('/:id', TenantController.getTenantById);

// Update tenant
router.put('/:id', TenantController.updateTenant);

// Delete tenant
router.delete('/:id', TenantController.deleteTenant);

export default router;
