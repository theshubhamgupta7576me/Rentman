import React from 'react';
import { Edit, Trash2, FileText, Building, Eye, Archive } from 'lucide-react';
import { Tenant } from '../../types';
import { formatCurrency } from '../../utils/dateUtils';

interface TenantCardProps {
  tenant: Tenant;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenantId: string) => void;
  onViewDetails: (tenant: Tenant) => void;
  onArchive: (tenant: Tenant) => void;
}

export function TenantCard({ tenant, onEdit, onDelete, onViewDetails, onArchive }: TenantCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails(tenant)}>
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{tenant.name}</h3>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Building className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{tenant.propertyName}</span>
          </div>
        </div>
        <div className="flex -space-x-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onViewDetails(tenant)}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(tenant)}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onArchive(tenant)}
            className="p-2 text-gray-500 hover:text-orange-600 transition-colors"
                              title="Archive tenant"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(tenant.id)}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Property Type</p>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              tenant.propertyType === 'residential' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {tenant.propertyType === 'residential' ? '🏠 Residential' : '🏢 Commercial'}
            </div>
          </div>
          <div className="min-w-0 flex-1 ml-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Monthly Rent</p>
            <p className="text-lg font-semibold text-green-600 truncate">
              {formatCurrency(tenant.monthlyRent)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}