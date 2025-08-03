import React, { useState } from 'react';
import { X, Download, FileText, Image as ImageIcon, ZoomIn, Archive, Calendar, Eye } from 'lucide-react';
import { Tenant, UploadedFile, RentLog } from '../../types';
import { formatCurrency, formatDate } from '../../utils/dateUtils';
import { downloadFile, formatFileSize, isImage, isPDF } from '../../utils/fileUtils';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface TenantDetailsModalProps {
  tenant: Tenant;
  rentLogs: RentLog[];
  onClose: () => void;
  onArchive?: (tenant: Tenant) => void;
}

export function TenantDetailsModal({ tenant, rentLogs, onClose, onArchive }: TenantDetailsModalProps) {
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);

  const handleFileClick = (file: UploadedFile) => {
    setSelectedFile(file);
  };

  const handleArchiveClick = () => {
    setIsArchiveConfirmOpen(true);
  };

  const confirmArchive = () => {
    if (onArchive) {
      onArchive(tenant);
    }
    setIsArchiveConfirmOpen(false);
  };

  const renderFilePreview = (file: UploadedFile) => {
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
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      );
    } else if (isPDF(file)) {
      return (
        <div className="w-full h-[50vh] border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">PDF Preview</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-[50vh] bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Preview not available</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-2 sm:px-4 pt-4 pb-4">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative w-full max-w-7xl max-h-[90vh] overflow-hidden bg-white shadow-xl rounded-lg flex flex-col mx-2 sm:mx-0">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
            <div>
              <h3 className="text-xl md:text-3xl font-bold text-gray-900">
                {tenant.name}
              </h3>
              <p className="text-sm md:text-lg text-gray-600 mt-1">{tenant.propertyName}</p>
            </div>
            <div className="flex items-center space-x-3">
              {onArchive && (
                <button
                  onClick={handleArchiveClick}
                  className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                  title="Archive tenant"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 md:p-3 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
              {/* Left Column - Tenant Details & Documents */}
              <div className="space-y-4 md:space-y-6">
                {/* Tenant Information Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-blue-100">
                  <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Tenant Information
                  </h4>
                  
                  <div className="space-y-3 md:space-y-4">
                    <div className="bg-white rounded-lg p-2 md:p-4 border border-blue-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Monthly Rent</p>
                      <p className="text-lg md:text-2xl font-bold text-green-600">
                        {formatCurrency(tenant.monthlyRent)}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-2 md:p-4 border border-blue-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Security Deposit</p>
                      <p className="text-lg md:text-2xl font-bold text-purple-600">
                        {formatCurrency(tenant.securityDeposit)}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="bg-white rounded-lg p-2 md:p-4 border border-blue-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Start Date</p>
                        <p className="text-sm md:text-lg font-semibold text-gray-900">{formatDate(tenant.startDate)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 md:p-4 border border-blue-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Start Meter Reading</p>
                        <p className="text-sm md:text-lg font-semibold text-gray-900">{tenant.startMeterReading}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="bg-white rounded-lg p-2 md:p-4 border border-blue-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Property Type</p>
                        <div className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                          tenant.propertyType === 'residential' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {tenant.propertyType === 'residential' ? '🏠 Residential' : '🏢 Commercial'}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2 md:p-4 border border-blue-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone Number</p>
                        <p className="text-sm md:text-lg font-semibold text-gray-900">{tenant.phoneNumber || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    {tenant.notes && (
                      <div className="bg-white rounded-lg p-2 md:p-4 border border-blue-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed">{tenant.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents Section */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 md:p-6 border border-gray-200">
                  <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6 flex items-center">
                    <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
                    Documents & Files
                  </h4>
                  
                  {tenant.documents.length === 0 ? (
                    <div className="text-center py-6 md:py-8">
                      <FileText className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 md:mb-3" />
                      <p className="text-sm md:text-base text-gray-500">No documents uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-2 md:space-y-3">
                      {tenant.documents.map(file => (
                        <div
                          key={file.id}
                          onClick={() => handleFileClick(file)}
                          className="flex items-center justify-between p-3 md:p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            {isImage(file) ? (
                              <ImageIcon className="w-4 h-4 md:w-6 md:h-6 text-blue-600 mr-3 md:mr-4" />
                            ) : (
                              <FileText className="w-4 h-4 md:w-6 md:h-6 text-gray-600 mr-3 md:mr-4" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">
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
                            <Download className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Rent Log History */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-purple-200 flex flex-col">
                <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6 flex items-center flex-shrink-0">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Rent Log History
                </h4>

                {rentLogs.length === 0 ? (
                  <div className="text-center py-6 md:py-8 flex-1 flex items-center justify-center">
                    <Calendar className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 md:mb-3" />
                    <p className="text-sm md:text-base text-gray-500">No rent logs found</p>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4 overflow-y-auto flex-1">
                    {rentLogs.map(log => (
                      <div key={log.id} className="bg-white rounded-lg p-3 md:p-4 border border-purple-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm md:text-base font-semibold text-gray-900">{formatDate(log.date)}</h5>
                          <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                            log.paymentMode === 'cash' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {log.paymentMode === 'cash' ? '💵 Cash' : '💳 Online'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                          <div>
                            <p className="text-gray-500">Rent Paid</p>
                            <p className="font-semibold text-green-600">{formatCurrency(log.rentPaid)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Meter Bill</p>
                            <p className="font-semibold text-orange-600">{formatCurrency(log.meterBill)}</p>
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
                        
                        {log.notes && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-600">{log.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Archive Button - Sticky at bottom */}
          {onArchive && (
            <div className="md:hidden flex-shrink-0 border-t border-gray-200 p-4 bg-white">
              <button
                onClick={handleArchiveClick}
                className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive tenant
              </button>
            </div>
          )}
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

      {/* Archive Confirmation Modal */}
      <ConfirmationModal
        isOpen={isArchiveConfirmOpen}
        onClose={() => setIsArchiveConfirmOpen(false)}
        onConfirm={confirmArchive}
        title="Archive tenant"
        message={`Are you sure you want to archive ${tenant.name}? This will move the tenant to the archived section and no further rent logs can be added for them.`}
        confirmText="Archive tenant"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
} 