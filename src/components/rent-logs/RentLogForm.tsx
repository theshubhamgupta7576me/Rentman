import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RentLog, UploadedFile } from '../../types';
import { FileUpload } from '../common/FileUpload';
import { getMonthFromDate } from '../../utils/dateUtils';

interface RentLogFormProps {
  rentLog?: RentLog;
  onSubmit: (logData: Omit<RentLog, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  preselectedTenantId?: string;
}

export function RentLogForm({ rentLog, onSubmit, onCancel, preselectedTenantId }: RentLogFormProps) {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    tenantId: preselectedTenantId || '',
    date: new Date().toISOString().split('T')[0],
    rentPaid: '',
    previousMeterReading: '',
    currentMeterReading: '',
    unitPrice: state.settings.defaultUnitPrice.toString(),
    collector: '',
    paymentMode: 'cash' as 'online' | 'cash',
    notes: '',
  });
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (rentLog) {
      setFormData({
        tenantId: rentLog.tenantId,
        date: rentLog.date,
        rentPaid: rentLog.rentPaid.toString(),
        previousMeterReading: rentLog.previousMeterReading.toString(),
        currentMeterReading: rentLog.currentMeterReading.toString(),
        unitPrice: rentLog.unitPrice.toString(),
        collector: rentLog.collector,
        paymentMode: rentLog.paymentMode,
        notes: rentLog.notes,
      });
      setAttachments(rentLog.attachments);
    }
  }, [rentLog]);

  // Auto-fill rent amount when tenant is selected (for new logs only)
  useEffect(() => {
    if (formData.tenantId && !rentLog) {
      const selectedTenant = state.tenants.find(tenant => tenant.id === formData.tenantId);
      if (selectedTenant) {
        setFormData(prev => ({
          ...prev,
          rentPaid: selectedTenant.monthlyRent.toString()
        }));
      }
    }
  }, [formData.tenantId, rentLog, state.tenants]);

  const selectedTenant = state.tenants.find(tenant => tenant.id === formData.tenantId);
  
  const units = formData.currentMeterReading && formData.previousMeterReading 
    ? parseInt(formData.currentMeterReading) - parseInt(formData.previousMeterReading)
    : 0;
  const meterBill = units * parseFloat(formData.unitPrice);
  const total = parseFloat(formData.rentPaid || '0') + meterBill;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tenantId || formData.tenantId.trim() === '') {
      newErrors.tenantId = 'Tenant is required';
    }
    if (!formData.collector || formData.collector.trim() === '') {
      newErrors.collector = 'Collector is required';
    }
    if (!formData.currentMeterReading || formData.currentMeterReading.trim() === '') {
      newErrors.currentMeterReading = 'Current meter reading is required';
    } else if (parseFloat(formData.currentMeterReading) < parseFloat(formData.previousMeterReading || '0')) {
      newErrors.currentMeterReading = 'Current MR less than previous MR';
    }
    if (!formData.unitPrice || formData.unitPrice.trim() === '') {
      newErrors.unitPrice = 'Unit price is required';
    }
    if (!formData.date || formData.date.trim() === '') {
      newErrors.date = 'Date is required';
    }
    if (!formData.rentPaid || formData.rentPaid.trim() === '') {
      newErrors.rentPaid = 'Rent paid is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    const tenantName = selectedTenant?.name || '';

    const rentLogData = {
      tenantId: formData.tenantId,
      tenantName,
      date: formData.date,
      rentPaid: parseFloat(formData.rentPaid),
      previousMeterReading: parseFloat(formData.previousMeterReading || '0'),
      currentMeterReading: parseFloat(formData.currentMeterReading),
      units: units || 0,
      unitPrice: parseFloat(formData.unitPrice),
      meterBill: meterBill || 0,
      total: total || 0,
      collector: formData.collector,
      paymentMode: formData.paymentMode,
      notes: formData.notes,
      attachments,
    };

    onSubmit(rentLogData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear current meter reading error if previous meter reading is changed
    if (field === 'previousMeterReading' && errors.currentMeterReading) {
      setErrors(prev => ({ ...prev, currentMeterReading: '' }));
    }
    // Real-time validation for current meter reading
    if (field === 'currentMeterReading') {
      const currentValue = parseFloat(value);
      const previousValue = parseFloat(formData.previousMeterReading || '0');
      if (value && currentValue < previousValue) {
        setErrors(prev => ({ ...prev, currentMeterReading: 'Current MR less than previous MR' }));
      } else if (errors.currentMeterReading) {
        setErrors(prev => ({ ...prev, currentMeterReading: '' }));
      }
    }
  };

  return (
    <form id="rent-log-form" onSubmit={handleSubmit} className="space-y-6">
      {/* Mobile Layout - Single Column */}
      <div className="block lg:hidden space-y-4">
        {/* Tenant */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tenant *
          </label>
          <select
            value={formData.tenantId}
            onChange={(e) => handleInputChange('tenantId', e.target.value)}
            disabled={!!rentLog}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.tenantId ? 'border-red-500' : 'border-gray-300'
            } ${rentLog ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            required
          >
            <option value="">Select tenant</option>
            {state.tenants
              .filter(tenant => !tenant.isArchived || (rentLog && tenant.id === rentLog.tenantId))
              .map(tenant => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name} - {tenant.propertyName}
                </option>
              ))}
          </select>
          {errors.tenantId && <p className="mt-1 text-sm text-red-600">{errors.tenantId}</p>}
        </div>

        {/* Collector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Collector *
          </label>
          <select
            value={formData.collector}
            onChange={(e) => handleInputChange('collector', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.collector ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select collector</option>
            {state.rentCollectors.map(collector => (
              <option key={collector.id} value={collector.name}>
                {collector.name}
              </option>
            ))}
          </select>
          {errors.collector && <p className="mt-1 text-sm text-red-600">{errors.collector}</p>}
        </div>

        {/* Previous MR & Current MR - Side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Previous MR
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.previousMeterReading}
              onChange={(e) => handleInputChange('previousMeterReading', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1250"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current MR *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.currentMeterReading}
              onChange={(e) => handleInputChange('currentMeterReading', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.currentMeterReading ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1380"
              required
            />
            {errors.currentMeterReading && <p className="mt-1 text-sm text-red-600">{errors.currentMeterReading}</p>}
          </div>
        </div>

        {/* Unit Price & Units - Side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit Price (₹) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => handleInputChange('unitPrice', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.unitPrice ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="8"
              required
            />
            {errors.unitPrice && <p className="mt-1 text-sm text-red-600">{errors.unitPrice}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Units
            </label>
            <input
              type="number"
              value={units}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              readOnly
            />
          </div>
        </div>

        {/* Meter Bill & Rent Paid - Side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meter Bill
            </label>
            <input
              type="text"
              value={`₹${meterBill.toLocaleString()}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rent Paid (₹) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.rentPaid}
              onChange={(e) => handleInputChange('rentPaid', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.rentPaid ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="15000"
              required
            />
            {errors.rentPaid && <p className="mt-1 text-sm text-red-600">{errors.rentPaid}</p>}
          </div>
        </div>

        {/* Total Amount - Full width */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Amount
          </label>
          <input
            type="text"
            value={`₹${total.toLocaleString()}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-green-50 cursor-not-allowed font-semibold"
            readOnly
          />
        </div>

        {/* Payment Mode - Full width */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Mode
          </label>
          <div className="flex gap-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="cash"
                checked={formData.paymentMode === 'cash'}
                onChange={(e) => handleInputChange('paymentMode', e.target.value as 'online' | 'cash')}
                className="sr-only"
              />
              <span className={`inline-block px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                formData.paymentMode === 'cash' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                💵 Cash
              </span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="online"
                checked={formData.paymentMode === 'online'}
                onChange={(e) => handleInputChange('paymentMode', e.target.value as 'online' | 'cash')}
                className="sr-only"
              />
              <span className={`inline-block px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                formData.paymentMode === 'online' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                💳 Online
              </span>
            </label>
          </div>
        </div>

        {/* Date - Full width */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') return;
              if (!/[\d-]/.test(e.key)) e.preventDefault();
            }}
            max="9999-12-31"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
        </div>
      </div>

      {/* Desktop Layout - Two Columns */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-8">
        {/* Left Column - Tenant Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tenant *
            </label>
            <select
              value={formData.tenantId}
              onChange={(e) => handleInputChange('tenantId', e.target.value)}
              disabled={!!rentLog}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.tenantId ? 'border-red-500' : 'border-gray-300'
              } ${rentLog ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              required
            >
              <option value="">Select tenant</option>
              {state.tenants
                .filter(tenant => !tenant.isArchived || (rentLog && tenant.id === rentLog.tenantId))
                .map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} - {tenant.propertyName}
                  </option>
                ))}
            </select>
            {errors.tenantId && <p className="mt-1 text-sm text-red-600">{errors.tenantId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previous MR
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.previousMeterReading}
                onChange={(e) => handleInputChange('previousMeterReading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1250"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current MR *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.currentMeterReading}
                onChange={(e) => handleInputChange('currentMeterReading', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.currentMeterReading ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1380"
                required
              />
              {errors.currentMeterReading && <p className="mt-1 text-sm text-red-600">{errors.currentMeterReading}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meter Bill
              </label>
              <input
                type="text"
                value={`₹${meterBill.toLocaleString()}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rent Paid (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.rentPaid}
                onChange={(e) => handleInputChange('rentPaid', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.rentPaid ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="15000"
                required
              />
              {errors.rentPaid && <p className="mt-1 text-sm text-red-600">{errors.rentPaid}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Mode
            </label>
            <div className="flex gap-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="cash"
                  checked={formData.paymentMode === 'cash'}
                  onChange={(e) => handleInputChange('paymentMode', e.target.value as 'online' | 'cash')}
                  className="sr-only"
                />
                <span className={`inline-block px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  formData.paymentMode === 'cash' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  💵 Cash
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="online"
                  checked={formData.paymentMode === 'online'}
                  onChange={(e) => handleInputChange('paymentMode', e.target.value as 'online' | 'cash')}
                  className="sr-only"
                />
                <span className={`inline-block px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  formData.paymentMode === 'online' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  💳 Online
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Collector Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collector *
            </label>
            <select
              value={formData.collector}
              onChange={(e) => handleInputChange('collector', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.collector ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select collector</option>
              {state.rentCollectors.map(collector => (
                <option key={collector.id} value={collector.name}>
                  {collector.name}
                </option>
              ))}
            </select>
            {errors.collector && <p className="mt-1 text-sm text-red-600">{errors.collector}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.unitPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="8"
                required
              />
              {errors.unitPrice && <p className="mt-1 text-sm text-red-600">{errors.unitPrice}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Units
              </label>
              <input
                type="number"
                value={units}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Amount
            </label>
            <input
              type="text"
              value={`₹${total.toLocaleString()}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-green-50 cursor-not-allowed font-semibold"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') return;
                if (!/[\d-]/.test(e.key)) e.preventDefault();
              }}
              max="9999-12-31"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>
        </div>
      </div>

      {/* Full Width Fields - Both Mobile and Desktop */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Any additional notes for this payment..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachments
        </label>
        <FileUpload
          files={attachments}
          onFilesChange={setAttachments}
        />
      </div>
    </form>
  );
}