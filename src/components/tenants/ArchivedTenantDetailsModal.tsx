import React, { useState } from 'react';
import { X, Download, FileText, ImageIcon, Building, Calendar, DollarSign, Zap, Calculator, Eye, RotateCcw } from 'lucide-react';
import { Tenant, RentLog, TenantFinancialSummary } from '../../types';
import { formatCurrency, formatDate } from '../../utils/dateUtils';
import { formatFileSize, downloadFile, isImage, isPDF } from '../../utils/fileUtils';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface ArchivedTenantDetailsModalProps {
  tenant: Tenant;
  rentLogs: RentLog[];
  isOpen: boolean;
  onClose: () => void;
  onUnarchive: (tenantId: string) => void;
}

export function ArchivedTenantDetailsModal({ 
  tenant, 
  rentLogs, 
  isOpen, 
  onClose, 
  onUnarchive 
}: ArchivedTenantDetailsModalProps) {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [isUnarchiveConfirmOpen, setIsUnarchiveConfirmOpen] = useState(false);

  const calculateFinancialSummary = (): TenantFinancialSummary => {
    const totalRentPaid = rentLogs.reduce((sum, log) => sum + log.rentPaid, 0);
    const totalElectricityBill = rentLogs.reduce((sum, log) => sum + log.meterBill, 0);
    const totalAmountPaid = totalRentPaid + totalElectricityBill;
    
    const startDate = new Date(tenant.startDate);
    const closingDate = new Date(tenant.closingDate!);
    const totalMonthsOccupied = Math.ceil((closingDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));

    return {
      totalRentPaid,
      totalElectricityBill,
      totalAmountPaid,
      totalMonthsOccupied
    };
  };

  const financialSummary = calculateFinancialSummary();

  const handleFileClick = (file: any) => {
    setSelectedFile(file);
  };

  const handleUnarchiveClick = () => {
    setIsUnarchiveConfirmOpen(true);
  };

  const confirmUnarchive = () => {
    onUnarchive(tenant.id);
    setIsUnarchiveConfirmOpen(false);
  };

  const renderFilePreview = (file: any) => {
    if (isImage(file)) {
      return (
        <div className="relative">
          <div className="max-w-full max-h-[50vh] overflow-hidden rounded-lg cursor-pointer group" onClick={() => setExpandedImage(file.data)}>
            <img
              src={file.data}
              alt={file.name}
              className="w-full h-[50vh] object-contain group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      );
    } else if (isPDF(file)) {
      return (
        <div className="w-full h-[50vh] border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">PDF Preview</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-[50vh] bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Preview not available</p>
          </div>
        </div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
                <div
          className="fixed inset-0 transition-all duration-300 ease-out bg-gray-500 bg-opacity-75 backdrop-blur-sm animate-in fade-in"
          onClick={onClose}
        />

        <div className="relative w-full max-w-7xl max-h-[90vh] overflow-hidden bg-white shadow-xl rounded-lg flex flex-col transition-all duration-300 ease-out animate-in zoom-in-95 slide-in-from-bottom-4">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">
                  {tenant.name}
                </h3>
                <p className="text-lg text-gray-600 mt-1">{tenant.propertyName}</p>
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    📁 Archived Tenant
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleUnarchiveClick}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                title="Unarchive tenant"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Unarchive
              </button>
              <button
                onClick={onClose}
                className="p-3 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Tenant Details & Financial Summary */}
              <div className="space-y-6">
                {/* General Information */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    General Information
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Monthly Rent</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(tenant.monthlyRent)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Security Deposit</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(tenant.securityDeposit)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Start Date</p>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(tenant.startDate)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Start Meter</p>
                      <p className="text-lg font-semibold text-gray-900">{tenant.startMeterReading} units</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Closing Date</p>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(tenant.closingDate!)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Property Type</p>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        tenant.propertyType === 'residential' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {tenant.propertyType === 'residential' ? '🏠 Residential' : '🏢 Commercial'}
                      </div>
                    </div>
                  </div>

                  {tenant.closingNotes && (
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Closing Notes</p>
                      <p className="text-gray-700 leading-relaxed">{tenant.closingNotes}</p>
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Financial Summary
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Rent Paid</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(financialSummary.totalRentPaid)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Electricity</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(financialSummary.totalElectricityBill)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Amount Paid</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(financialSummary.totalAmountPaid)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Months Occupied</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {financialSummary.totalMonthsOccupied}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
                    Documents & Files
                  </h4>
                  
                  {tenant.documents.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No documents uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tenant.documents.map(file => (
                        <div
                          key={file.id}
                          onClick={() => handleFileClick(file)}
                          className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            {isImage(file) ? (
                              <ImageIcon className="w-6 h-6 text-blue-600 mr-4" />
                            ) : (
                              <FileText className="w-6 h-6 text-gray-600 mr-4" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadFile(file);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-100"
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Rent Log History */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Rent Log History
                </h4>
                
                {rentLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No rent logs found</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {rentLogs.map(log => (
                      <div key={log.id} className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-purple-600" />
                            <span className="font-semibold text-gray-900">{formatDate(log.date)}</span>
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            log.paymentMode === 'cash' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {log.paymentMode === 'cash' ? '💵 Cash' : '💳 Online'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Rent Paid</p>
                            <p className="font-semibold text-green-600">{formatCurrency(log.rentPaid)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Meter Bill</p>
                            <p className="font-semibold text-blue-600">{formatCurrency(log.meterBill)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Total</p>
                            <p className="font-semibold text-purple-600">{formatCurrency(log.total)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Collector</p>
                            <p className="font-semibold text-gray-900">{log.collector}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="text-gray-500">Previous Meter</p>
                              <p className="font-medium">{log.previousMeterReading}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Current Meter</p>
                              <p className="font-medium">{log.currentMeterReading}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Units</p>
                              <p className="font-medium">{log.units}</p>
                            </div>
                          </div>
                        </div>
                        
                        {log.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Notes</p>
                            <p className="text-sm text-gray-700">{log.notes}</p>
                          </div>
                        )}
                        
                        {log.attachments.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-2">Attachments</p>
                            <div className="space-y-2">
                              {log.attachments.map(file => (
                                <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center">
                                    {isImage(file) ? (
                                      <ImageIcon className="w-4 h-4 text-blue-600 mr-2" />
                                    ) : (
                                      <FileText className="w-4 h-4 text-gray-600 mr-2" />
                                    )}
                                    <span className="text-xs text-gray-700">{file.name}</span>
                                  </div>
                                  <button
                                    onClick={() => downloadFile(file)}
                                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                  >
                                    <Download className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm" onClick={() => setExpandedImage(null)}>
          <div className="relative max-w-4xl max-h-full p-4">
            <img
              src={expandedImage}
              alt="Expanded preview"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Unarchive Confirmation Modal */}
      <ConfirmationModal
        isOpen={isUnarchiveConfirmOpen}
        onClose={() => setIsUnarchiveConfirmOpen(false)}
        onConfirm={confirmUnarchive}
        title="Unarchive tenant"
        message={`Are you sure you want to unarchive ${tenant.name}? This will move the tenant back to the active tenants list and allow new rent logs to be added for them.`}
        confirmText="Unarchive tenant"
        cancelText="Cancel"
        type="info"
      />
    </div>
  );
} 