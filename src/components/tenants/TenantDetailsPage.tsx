import React, { useState } from 'react';
import { ArrowLeft, X, Download, FileText, ImageIcon, ZoomIn, Archive, Calendar, Edit, Trash2 } from 'lucide-react';
import { Tenant, UploadedFile, RentLog, ArchiveTenantFormData } from '../../types';
import { formatCurrency, formatDate } from '../../utils/dateUtils';
import { downloadFile, formatFileSize, isImage, isPDF } from '../../utils/fileUtils';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { Modal } from '../common/Modal';
import { TenantForm } from './TenantForm';
import { ArchiveTenantModal } from './ArchiveTenantModal';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

interface TenantDetailsPageProps {
  tenantId: string;
  onBack: () => void;
}

export function TenantDetailsPage({ tenantId, onBack }: TenantDetailsPageProps) {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const tenant = state.tenants.find(t => t.id === tenantId);
  const rentLogs = state.rentLogs.filter(log => log.tenantId === tenantId);

  if (!tenant) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Tenant not found</h2>
          <p className="text-gray-600 mb-4">The tenant you're looking for doesn't exist.</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const handleFileClick = (file: UploadedFile) => {
    setSelectedFile(file);
  };

  const handleArchiveClick = () => {
    setIsArchiveModalOpen(true);
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleArchiveTenant = (tenantId: string, formData: ArchiveTenantFormData) => {
    const archivedTenant = {
      ...tenant,
      isArchived: true,
      closingDate: formData.closingDate,
      closingNotes: formData.closingNotes,
    };
    dispatch({ type: 'UPDATE_TENANT', payload: archivedTenant });
    showToast(`Tenant ${tenant.name} archived successfully`, 'warning');
    onBack();
    setIsArchiveModalOpen(false);
  };

  const confirmDelete = () => {
    dispatch({ type: 'DELETE_TENANT', payload: tenantId });
    showToast(`Tenant ${tenant.name} deleted successfully`, 'info');
    onBack();
    setIsDeleteConfirmOpen(false);
  };

  const handleEditSubmit = (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => {
    const updatedTenant = {
      ...tenant,
      ...tenantData,
    };
    dispatch({ type: 'UPDATE_TENANT', payload: updatedTenant });
    showToast(`Tenant ${tenant.name} updated successfully`, 'success');
    setIsEditModalOpen(false);
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
    <div className="p-4 md:p-6 pb-20 md:pb-6 md:pt-28">
      {/* Desktop Sticky Header */}
      <div className="hidden md:block fixed top-0 left-64 right-0 bg-white border-b border-gray-200 z-30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-reddit-sans-bold text-gray-900">{tenant.name}</h1>
              <p className="text-sm font-reddit-sans-regular text-gray-600">{tenant.propertyName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleEditClick}
              className="hidden md:flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              title="Edit tenant"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleArchiveClick}
              className="hidden md:flex items-center px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
              title="Archive tenant"
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </button>
            <button
              onClick={handleDeleteClick}
              className="hidden md:flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              title="Delete tenant"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{tenant.name}</h1>
            <p className="text-sm text-gray-600">{tenant.propertyName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleEditClick}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Edit tenant"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={handleArchiveClick}
            className="p-2 text-orange-500 hover:text-orange-700 transition-colors"
            title="Archive tenant"
          >
            <Archive className="w-5 h-5" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-2 text-red-500 hover:text-red-700 transition-colors"
            title="Delete tenant"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 max-h-[600px]">
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

        {/* Right Column - File Preview & Rent Log History */}
        <div className="space-y-4 md:space-y-6">
          {/* File Preview Section */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 md:p-6 border border-gray-200 flex flex-col">
            <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6 flex items-center flex-shrink-0">
              <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
              File Preview
            </h4>
            
            {selectedFile ? (
              <div className="space-y-3 md:space-y-4 flex-1">
                <div className="flex items-center justify-between bg-white rounded-lg p-3 md:p-4 border border-gray-200">
                  <div className="flex items-center">
                    {isImage(selectedFile) ? (
                      <ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mr-2 md:mr-3" />
                    ) : (
                      <FileText className="w-4 h-4 md:w-5 md:h-5 text-gray-600 mr-2 md:mr-3" />
                    )}
                    <span className="text-xs md:text-sm font-semibold text-gray-900 truncate">{selectedFile.name}</span>
                  </div>
                  <button
                    onClick={() => downloadFile(selectedFile)}
                    className="flex items-center px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Download
                  </button>
                </div>
                
                <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm flex-1">
                  {renderFilePreview(selectedFile)}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 md:h-64 bg-white rounded-lg border-2 border-dashed border-gray-300 flex-1">
                <div className="text-center">
                  <FileText className="w-8 h-8 md:w-16 md:h-16 text-gray-400 mx-auto mb-2 md:mb-4" />
                  <p className="text-sm md:text-lg text-gray-500">Select a file to preview</p>
                  <p className="text-xs md:text-sm text-gray-400 mt-1">Click on any file from the list</p>
                </div>
              </div>
            )}
          </div>

          {/* Rent Log History Section */}
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
      <div className="md:hidden fixed bottom-20 left-4 right-4">
        <button
          onClick={handleArchiveClick}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Archive className="w-4 h-4 mr-2" />
          Archive tenant
        </button>
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

      {/* Archive Tenant Modal */}
      <ArchiveTenantModal
        tenant={tenant}
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onArchive={handleArchiveTenant}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete tenant"
        message={`Are you sure you want to delete ${tenant.name}? This action cannot be undone and will permanently remove the tenant and all associated rent logs.`}
        confirmText="Delete tenant"
        cancelText="Cancel"
        type="danger"
      />

      {/* Edit Tenant Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit tenant"
        size="lg"
        buttons={
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="tenant-form"
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update tenant
            </button>
          </div>
        }
      >
        <TenantForm
          tenant={tenant}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
} 