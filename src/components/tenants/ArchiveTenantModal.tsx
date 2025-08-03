import React, { useState } from 'react';
import { X, Calendar, FileText } from 'lucide-react';
import { Tenant, ArchiveTenantFormData } from '../../types';
import { Modal } from '../common/Modal';

interface ArchiveTenantModalProps {
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
  onArchive: (tenantId: string, formData: ArchiveTenantFormData) => void;
}

export function ArchiveTenantModal({ tenant, isOpen, onClose, onArchive }: ArchiveTenantModalProps) {
  const [formData, setFormData] = useState<ArchiveTenantFormData>({
    closingDate: new Date().toISOString().split('T')[0],
    closingNotes: ''
  });

  const handleInputChange = (field: keyof ArchiveTenantFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.closingDate) return;
    
    onArchive(tenant.id, formData);
    onClose();
    setFormData({ closingDate: '', closingNotes: '' });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Archive tenant"
      size="md"
      buttons={
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="archive-tenant-form"
            disabled={!formData.closingDate}
            className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Archive tenant
          </button>
        </div>
      }
    >
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {tenant.name} - {tenant.propertyName}
        </p>
      </div>
      
      <form id="archive-tenant-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Closing Date *
          </label>
          <input
            type="date"
            value={formData.closingDate}
            onChange={(e) => handleInputChange('closingDate', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') return;
              if (!/[\d-]/.test(e.key)) e.preventDefault();
            }}
            max="9999-12-31"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 cursor-text"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Closing Notes
          </label>
          <textarea
            value={formData.closingNotes}
            onChange={(e) => handleInputChange('closingNotes', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
            placeholder="Add any notes about the tenant's departure, condition of property, final settlement, etc..."
          />
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <X className="w-5 h-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">
                Important notice
              </h4>
              <p className="text-sm text-red-700 mt-1">
                Archiving this tenant will:
              </p>
              <ul className="text-sm text-red-700 mt-2 list-disc list-inside space-y-1">
                <li>Move them to the archived tenants section</li>
                <li>Prevent new rent logs from being created</li>
                <li>Exclude them from dashboard statistics</li>
                <li>Make their profile read-only</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
} 