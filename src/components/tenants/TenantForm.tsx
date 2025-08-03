import React, { useState, useEffect } from 'react';
import { Tenant, UploadedFile } from '../../types';
import { FileUpload } from '../common/FileUpload';

interface TenantFormProps {
  tenant?: Tenant;
  onSubmit: (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function TenantForm({ tenant, onSubmit, onCancel }: TenantFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    propertyName: '',
    phoneNumber: '',
    monthlyRent: '',
    securityDeposit: '',
    startDate: new Date().toISOString().split('T')[0],
    startMeterReading: '',
    description: '',
    propertyType: 'residential' as 'residential' | 'commercial',
  });
  const [documents, setDocuments] = useState<UploadedFile[]>([]);

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name,
        propertyName: tenant.propertyName,
        phoneNumber: tenant.phoneNumber || '',
        monthlyRent: tenant.monthlyRent.toString(),
        securityDeposit: tenant.securityDeposit.toString(),
        startDate: tenant.startDate,
        startMeterReading: tenant.startMeterReading.toString(),
        description: tenant.notes || '',
        propertyType: tenant.propertyType,
      });
      setDocuments(tenant.documents);
    }
  }, [tenant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      name: formData.name,
      propertyName: formData.propertyName,
      phoneNumber: formData.phoneNumber,
      monthlyRent: parseFloat(formData.monthlyRent),
      securityDeposit: parseFloat(formData.securityDeposit),
      startDate: formData.startDate,
      startMeterReading: formData.startMeterReading,
      notes: formData.description,
      propertyType: formData.propertyType,
      documents,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form id="tenant-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tenant Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter tenant name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Name *
          </label>
          <input
            type="text"
            required
            value={formData.propertyName}
            onChange={(e) => handleInputChange('propertyName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Apartment 2A, House #123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="+91 98765 43210"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Rent (₹) *
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.monthlyRent}
            onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="15000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Security Deposit (₹) *
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.securityDeposit}
            onChange={(e) => handleInputChange('securityDeposit', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="30000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') return;
              if (!/[\d-]/.test(e.key)) e.preventDefault();
            }}
            max="9999-12-31"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Meter Reading *
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.startMeterReading}
            onChange={(e) => handleInputChange('startMeterReading', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="1250"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description / Notes
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Add any additional notes about the tenant, their preferences, special requirements, or important details..."
        />
      </div>
      

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Type
        </label>
        <div className="flex gap-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="residential"
              checked={formData.propertyType === 'residential'}
              onChange={(e) => handleInputChange('propertyType', e.target.value as 'residential' | 'commercial')}
              className="sr-only"
            />
            <span className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full transition-colors min-w-[120px] ${
              formData.propertyType === 'residential' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
              🏠 Residential
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="commercial"
              checked={formData.propertyType === 'commercial'}
              onChange={(e) => handleInputChange('propertyType', e.target.value as 'residential' | 'commercial')}
              className="sr-only"
            />
            <span className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full transition-colors min-w-[120px] ${
              formData.propertyType === 'commercial' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
              🏢 Commercial
            </span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Documents & Files
        </label>
        <FileUpload
          files={documents}
          onFilesChange={setDocuments}
        />
      </div>
    </form>
  );
}