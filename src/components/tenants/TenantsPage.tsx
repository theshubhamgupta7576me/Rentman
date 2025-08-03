import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Archive, Eye, Users, DollarSign, Shield, Home, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Tenant, ArchiveTenantFormData } from '../../types';
import { TenantForm } from './TenantForm';
import { TenantCard } from './TenantCard';
import { ArchivedTenantCard } from './ArchivedTenantCard';
import { TenantDetailsModal } from './TenantDetailsModal';
import { ArchivedTenantDetailsModal } from './ArchivedTenantDetailsModal';
import { ArchiveTenantModal } from './ArchiveTenantModal';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { formatCurrency } from '../../utils/dateUtils';

type TabType = 'active' | 'archived';

interface TenantsPageProps {
  onTenantSelect?: (tenantId: string) => void;
}

export function TenantsPage({ onTenantSelect }: TenantsPageProps) {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | undefined>();
  const [viewingTenant, setViewingTenant] = useState<Tenant | undefined>();
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archivingTenant, setArchivingTenant] = useState<Tenant | undefined>();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingTenantId, setDeletingTenantId] = useState<string | null>(null);
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isPropertiesModalOpen, setIsPropertiesModalOpen] = useState(false);

  // Filter tenants based on active tab and search term
  const activeTenants = state.tenants.filter(tenant => !tenant.isArchived);
  const archivedTenants = state.tenants.filter(tenant => tenant.isArchived);

  const filteredTenants = (activeTab === 'active' ? activeTenants : archivedTenants).filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.propertyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary statistics (only for active tenants)
  const totalMonthlyRent = activeTenants.reduce((sum, tenant) => sum + tenant.monthlyRent, 0);
  const totalDeposit = activeTenants.reduce((sum, tenant) => sum + tenant.securityDeposit, 0);
  const residentialCount = activeTenants.filter(tenant => tenant.propertyType === 'residential').length;
  const commercialCount = activeTenants.filter(tenant => tenant.propertyType === 'commercial').length;

  const handleAddTenant = (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => {
    const newTenant: Tenant = {
      ...tenantData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isArchived: false,
    };
    dispatch({ type: 'ADD_TENANT', payload: newTenant });
    showToast(`Tenant ${tenantData.name} added successfully`, 'success');
    setIsModalOpen(false);
  };

  const handleUpdateTenant = (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => {
    if (editingTenant) {
      const updatedTenant: Tenant = {
        ...tenantData,
        id: editingTenant.id,
        createdAt: editingTenant.createdAt,
        isArchived: editingTenant.isArchived,
        closingDate: editingTenant.closingDate,
        closingNotes: editingTenant.closingNotes,
      };
      dispatch({ type: 'UPDATE_TENANT', payload: updatedTenant });
      showToast(`Tenant ${tenantData.name} updated successfully`, 'success');
      setEditingTenant(undefined);
      setIsModalOpen(false);
    }
  };

  const handleDeleteTenant = (tenantId: string) => {
    setDeletingTenantId(tenantId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteTenant = () => {
    if (deletingTenantId) {
      const tenantToDelete = state.tenants.find(tenant => tenant.id === deletingTenantId);
      dispatch({ type: 'DELETE_TENANT', payload: deletingTenantId });
      if (tenantToDelete) {
        showToast(`Tenant ${tenantToDelete.name} deleted successfully`, 'info');
      }
      setDeletingTenantId(null);
    }
  };

  const handleArchiveTenant = (tenantId: string, formData: ArchiveTenantFormData) => {
    const tenant = state.tenants.find(t => t.id === tenantId);
    if (tenant) {
      const archivedTenant: Tenant = {
        ...tenant,
        isArchived: true,
        closingDate: formData.closingDate,
        closingNotes: formData.closingNotes,
      };
      dispatch({ type: 'UPDATE_TENANT', payload: archivedTenant });
      showToast(`Tenant ${tenant.name} archived successfully`, 'warning');
    }
  };

  const handleUnarchiveTenant = (tenantId: string) => {
    const tenant = state.tenants.find(t => t.id === tenantId);
    if (tenant) {
      const unarchivedTenant: Tenant = {
        ...tenant,
        isArchived: false,
        closingDate: undefined,
        closingNotes: undefined,
      };
      dispatch({ type: 'UPDATE_TENANT', payload: unarchivedTenant });
      showToast(`Tenant ${tenant.name} unarchived successfully`, 'success');
    }
  };

  const openAddModal = () => {
    setEditingTenant(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsModalOpen(true);
  };

  const openDetailsModal = (tenant: Tenant) => {
    if (onTenantSelect) {
      onTenantSelect(tenant.id);
    } else {
      setViewingTenant(tenant);
    }
  };

  const openArchiveModal = (tenant: Tenant) => {
    setArchivingTenant(tenant);
    setIsArchiveModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTenant(undefined);
  };

  const closeDetailsModal = () => {
    setViewingTenant(undefined);
  };

  const closeArchiveModal = () => {
    setIsArchiveModalOpen(false);
    setArchivingTenant(undefined);
  };

  // Get rent logs for archived tenant
  const getRentLogsForTenant = (tenantId: string) => {
    return state.rentLogs.filter(log => log.tenantId === tenantId);
  };

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 md:pt-28">
      {/* Desktop Sticky Header */}
      <div className="hidden md:block fixed top-0 left-64 right-0 bg-white border-b border-gray-200 z-30 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg md:text-xl font-medium text-gray-900">Tenants</h1>
            <p className="text-sm font-reddit-sans-regular text-gray-600">Manage your property tenants</p>
          </div>
          {activeTab === 'active' && (
            <button
              onClick={openAddModal}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add tenant
            </button>
          )}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center mb-4 md:mb-6">
        <div>
                      <h1 className="text-lg md:text-xl font-medium text-gray-900">Tenants</h1>
          <p className="text-sm text-gray-600">Manage your property tenants</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 md:mb-6">
        <div className="inline-flex space-x-1 bg-gray-100 p-0.5 md:p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-colors ${
              activeTab === 'active'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Active tenants</span>
            <span className="sm:hidden">Active</span>
            <span className="ml-1">({activeTenants.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`flex items-center px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-colors ${
              activeTab === 'archived'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Archive className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Archived tenants</span>
            <span className="sm:hidden">Archived</span>
            <span className="ml-1">({archivedTenants.length})</span>
          </button>
        </div>
      </div>

      {/* Summary Cards - Only show for active tenants */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-4 md:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">Total monthly rent</p>
                <p className="text-lg md:text-2xl font-bold text-green-600">{formatCurrency(totalMonthlyRent)}</p>
              </div>
              <div className="w-10 h-10 md:p-2 md:p-3 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm md:text-lg">₹</span>
              </div>
            </div>
            
            {/* Breakdown */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-600">Residential</span>
                </div>
                <span className="text-xs font-semibold text-blue-600">{formatCurrency(activeTenants.filter(tenant => tenant.propertyType === 'residential').reduce((sum, tenant) => sum + tenant.monthlyRent, 0))}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-600">Commercial</span>
                </div>
                <span className="text-xs font-semibold text-orange-600">{formatCurrency(activeTenants.filter(tenant => tenant.propertyType === 'commercial').reduce((sum, tenant) => sum + tenant.monthlyRent, 0))}</span>
              </div>
              <button
                onClick={() => setIsRentModalOpen(true)}
                className="w-full text-xs text-green-600 hover:text-green-700 font-medium py-2 px-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors mt-2"
              >
                View details
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">Total deposit</p>
                <p className="text-lg md:text-2xl font-bold text-purple-600">{formatCurrency(totalDeposit)}</p>
              </div>
              <div className="w-10 h-10 md:p-2 md:p-3 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 md:w-4 md:h-4 md:w-6 md:h-6 text-purple-600" />
              </div>
            </div>
            
            {/* Breakdown */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-600">Residential</span>
                </div>
                <span className="text-xs font-semibold text-blue-600">{formatCurrency(activeTenants.filter(tenant => tenant.propertyType === 'residential').reduce((sum, tenant) => sum + tenant.securityDeposit, 0))}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-600">Commercial</span>
                </div>
                <span className="text-xs font-semibold text-orange-600">{formatCurrency(activeTenants.filter(tenant => tenant.propertyType === 'commercial').reduce((sum, tenant) => sum + tenant.securityDeposit, 0))}</span>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="w-full text-xs text-purple-600 hover:text-purple-700 font-medium py-2 px-3 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors mt-2"
              >
                View details
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">Properties</p>
                <p className="text-lg md:text-2xl font-bold text-blue-600">{residentialCount + commercialCount}</p>
              </div>
              <div className="w-10 h-10 md:p-2 md:p-3 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 md:w-4 md:h-4 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
            
            {/* Breakdown */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-600">Residential</span>
                </div>
                <span className="text-xs font-semibold text-blue-600">{residentialCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-600">Commercial</span>
                </div>
                <span className="text-xs font-semibold text-orange-600">{commercialCount}</span>
              </div>
              <button
                onClick={() => setIsPropertiesModalOpen(true)}
                className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium py-2 px-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors mt-2"
              >
                View details
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 md:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'active' ? 'active' : 'archived'} tenants by name or property...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {filteredTenants.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {activeTab === 'active' ? (
              <Plus className="w-16 h-16 mx-auto" />
            ) : (
              <Archive className="w-16 h-16 mx-auto" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'active' ? 'No active tenants found' : 'No archived tenants found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? `No ${activeTab === 'active' ? 'active' : 'archived'} tenants match your search criteria.`
              : activeTab === 'active' 
                ? 'Get started by adding your first tenant.'
                : 'Archived tenants will appear here when you archive them.'
            }
          </p>
          {!searchTerm && activeTab === 'active' && (
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Tenant
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {filteredTenants.map(tenant => 
            activeTab === 'active' ? (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                onViewDetails={openDetailsModal}
                onEdit={openEditModal}
                onDelete={handleDeleteTenant}
                onArchive={openArchiveModal}
              />
            ) : (
              <ArchivedTenantCard
                key={tenant.id}
                tenant={tenant}
                onViewDetails={openDetailsModal}
                onUnarchive={handleUnarchiveTenant}
              />
            )
          )}
        </div>
      )}

      {/* Mobile Floating Action Button */}
      {activeTab === 'active' && (
        <button
          onClick={openAddModal}
          className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-50"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Modals */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingTenant ? 'Edit tenant' : 'Add new tenant'}
          size="lg"
          buttons={
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="tenant-form"
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingTenant ? 'Update tenant' : 'Add tenant'}
              </button>
            </div>
          }
        >
          <TenantForm
            tenant={editingTenant}
            onSubmit={editingTenant ? handleUpdateTenant : handleAddTenant}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {viewingTenant && (
        <TenantDetailsModal
          tenant={viewingTenant}
          rentLogs={getRentLogsForTenant(viewingTenant.id)}
          onClose={closeDetailsModal}
          onArchive={activeTab === 'active' ? openArchiveModal : undefined}
        />
      )}

      {archivingTenant && (
        <ArchiveTenantModal
          tenant={archivingTenant}
          isOpen={isArchiveModalOpen}
          onClose={closeArchiveModal}
          onArchive={handleArchiveTenant}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteTenant}
        title="Delete tenant"
        message="Are you sure you want to delete this tenant? This action cannot be undone."
        confirmText="Delete tenant"
        cancelText="Cancel"
        type="danger"
      />

      {/* Rent Breakdown Modal */}
      {isRentModalOpen && (
        <Modal
          isOpen={isRentModalOpen}
          onClose={() => setIsRentModalOpen(false)}
          title="Monthly Rent Breakdown"
          size="md"
          buttons={
            <div className="flex">
              <button
                type="button"
                onClick={() => setIsRentModalOpen(false)}
                className="flex-1 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Detailed breakdown of monthly rent by property type
            </div>
            <div className="space-y-3">
              {activeTenants.filter(tenant => tenant.propertyType === 'residential').map(tenant => (
                <div key={tenant.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">{tenant.propertyName}</div>
                    <div className="text-sm text-gray-600">{tenant.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">{formatCurrency(tenant.monthlyRent)}</div>
                    <div className="text-xs text-gray-500">Monthly rent</div>
                  </div>
                </div>
              ))}
              {activeTenants.filter(tenant => tenant.propertyType === 'commercial').map(tenant => (
                <div key={tenant.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">{tenant.propertyName}</div>
                    <div className="text-sm text-gray-600">{tenant.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-orange-600">{formatCurrency(tenant.monthlyRent)}</div>
                    <div className="text-xs text-gray-500">Monthly rent</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Deposit Breakdown Modal */}
      {isDepositModalOpen && (
        <Modal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
          title="Security Deposit Breakdown"
          size="md"
          buttons={
            <div className="flex">
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(false)}
                className="flex-1 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Detailed breakdown of security deposits by property type
            </div>
            <div className="space-y-3">
              {activeTenants.filter(tenant => tenant.propertyType === 'residential').map(tenant => (
                <div key={tenant.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">{tenant.propertyName}</div>
                    <div className="text-sm text-gray-600">{tenant.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">{formatCurrency(tenant.securityDeposit)}</div>
                    <div className="text-xs text-gray-500">Security deposit</div>
                  </div>
                </div>
              ))}
              {activeTenants.filter(tenant => tenant.propertyType === 'commercial').map(tenant => (
                <div key={tenant.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">{tenant.propertyName}</div>
                    <div className="text-sm text-gray-600">{tenant.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-orange-600">{formatCurrency(tenant.securityDeposit)}</div>
                    <div className="text-xs text-gray-500">Security deposit</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Properties Modal */}
      {isPropertiesModalOpen && (
        <Modal
          isOpen={isPropertiesModalOpen}
          onClose={() => setIsPropertiesModalOpen(false)}
          title="Properties List"
          size="md"
          buttons={
            <div className="flex">
              <button
                type="button"
                onClick={() => setIsPropertiesModalOpen(false)}
                className="flex-1 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              All properties with their details
            </div>
            <div className="space-y-3">
              {activeTenants.filter(tenant => tenant.propertyType === 'residential').map(tenant => (
                <div key={tenant.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">{tenant.propertyName}</div>
                    <div className="text-sm text-gray-600">{tenant.name}</div>
                    <div className="text-xs text-blue-600">Residential</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">{formatCurrency(tenant.monthlyRent)}</div>
                    <div className="text-xs text-gray-500">Monthly rent</div>
                  </div>
                </div>
              ))}
              {activeTenants.filter(tenant => tenant.propertyType === 'commercial').map(tenant => (
                <div key={tenant.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">{tenant.propertyName}</div>
                    <div className="text-sm text-gray-600">{tenant.name}</div>
                    <div className="text-xs text-orange-600">Commercial</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-orange-600">{formatCurrency(tenant.monthlyRent)}</div>
                    <div className="text-xs text-gray-500">Monthly rent</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}