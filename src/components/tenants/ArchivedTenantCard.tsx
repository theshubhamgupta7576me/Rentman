import React, { useState } from 'react';
import { Eye, RotateCcw, Building, Calendar } from 'lucide-react';
import { Tenant } from '../../types';
import { formatCurrency, formatDate } from '../../utils/dateUtils';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface ArchivedTenantCardProps {
  tenant: Tenant;
  onViewDetails: (tenant: Tenant) => void;
  onUnarchive: (tenantId: string) => void;
}

export function ArchivedTenantCard({ tenant, onViewDetails, onUnarchive }: ArchivedTenantCardProps) {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const handleUnarchive = () => {
    onUnarchive(tenant.id);
    setIsConfirmationModalOpen(false);
  };

  return (
    <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-3 md:p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails(tenant)}>
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{tenant.name}</h3>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Building className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{tenant.propertyName}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">Closed: {formatDate(tenant.closingDate!)}</span>
          </div>
        </div>
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onViewDetails(tenant)}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsConfirmationModalOpen(true)}
            className="p-2 text-gray-500 hover:text-green-600 transition-colors"
            title="Unarchive tenant"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Monthly Rent</p>
            <p className="text-lg font-semibold text-green-600 truncate">
              {formatCurrency(tenant.monthlyRent)}
            </p>
          </div>
          <div className="min-w-0 flex-1 ml-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Property Type</p>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              tenant.propertyType === 'residential' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {tenant.propertyType === 'residential' ? '🏠 Residential' : '🏢 Commercial'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Security Deposit</p>
            <p className="text-sm font-semibold text-purple-600 truncate">
              {formatCurrency(tenant.securityDeposit)}
            </p>
          </div>
          <div className="min-w-0 flex-1 ml-4">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap">
              📁 Archived
            </span>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleUnarchive}
        title="Unarchive tenant"
        message={`Are you sure you want to unarchive ${tenant.name}? This will move the tenant back to the active tenants list and allow new rent logs to be added for them.`}
        confirmText="Unarchive tenant"
        cancelText="Cancel"
        type="info"
      />
    </div>
  );
} 