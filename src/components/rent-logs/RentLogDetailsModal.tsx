import React, { useState } from 'react';
import { X, Download, FileText, ImageIcon, Calendar, DollarSign, Zap, Calculator, Eye, Building, Send } from 'lucide-react';
import { RentLog, UploadedFile } from '../../types';
import { formatCurrency, formatDate } from '../../utils/dateUtils';
import { downloadFile, formatFileSize, isImage, isPDF } from '../../utils/fileUtils';
import { useToast } from '../../context/ToastContext';
import { useApp } from '../../context/AppContext';

interface RentLogDetailsModalProps {
  rentLog: RentLog;
  isOpen: boolean;
  onClose: () => void;
}

export function RentLogDetailsModal({ rentLog, isOpen, onClose }: RentLogDetailsModalProps) {
  const { showToast } = useToast();
  const { state } = useApp();
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const tenant = state.tenants.find(t => t.id === rentLog.tenantId);

  const handleFileClick = (file: UploadedFile) => {
    setSelectedFile(file);
  };

  const generateWhatsAppMessage = () => {
    const monthYear = new Date(rentLog.date).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
    const day = new Date(rentLog.date).getDate();
    const month = new Date(rentLog.date).toLocaleDateString('en-US', { month: 'short' });
    
    return `🧾 Rent received for ${monthYear} on ${day} ${month} – ${rentLog.tenantName}

🏠 Rent: ₹${rentLog.rentPaid.toLocaleString()}
🔌 Meter: ${rentLog.previousMeterReading} → ${rentLog.currentMeterReading}
⚡️ Units: ${rentLog.units} @ ₹${rentLog.unitPrice}/unit
💡 Meter Bill: ₹${rentLog.meterBill.toLocaleString()}
💰 Total Received: ₹${rentLog.total.toLocaleString()}`;
  };

  const handleSendWhatsApp = () => {
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    
    if (tenant?.phoneNumber) {
      // Remove any non-digit characters and ensure it starts with country code
      const phoneNumber = tenant.phoneNumber.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      showToast(`WhatsApp message sent to ${rentLog.tenantName}`, 'success');
    } else {
      // Fallback to general WhatsApp if no phone number
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      showToast(`WhatsApp message prepared for ${rentLog.tenantName}`, 'info');
    }
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
      <div className="flex items-center justify-center min-h-screen px-2 sm:px-4 pt-4 pb-4">
                <div
          className="fixed inset-0 transition-all duration-300 ease-out bg-gray-500 bg-opacity-75 backdrop-blur-sm animate-in fade-in"
          onClick={onClose}
        />

        <div className="relative w-full max-w-7xl max-h-[90vh] overflow-hidden bg-white shadow-xl rounded-lg flex flex-col mx-2 sm:mx-0 transition-all duration-300 ease-out animate-in zoom-in-95 slide-in-from-bottom-4">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
            <div>
              <h3 className="text-xl md:text-3xl font-bold text-gray-900">
                {rentLog.tenantName}
              </h3>
              <p className="text-sm md:text-lg text-gray-600 mt-1">{formatDate(rentLog.date)}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSendWhatsApp}
                className="hidden md:flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Send WhatsApp Message"
              >
                <Send className="w-4 h-4 mr-2" />
                Send WhatsApp
              </button>
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
              {/* Left Column - Rent Log Details */}
              <div className="space-y-4 md:space-y-6">
                {/* Payment Information */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-blue-100">
                  <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Payment Information
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6">
                    <div className="bg-white rounded-lg p-2 md:p-4 border border-blue-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rent Paid</p>
                      <p className="text-lg md:text-2xl font-bold text-green-600">
                        {formatCurrency(rentLog.rentPaid)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2 md:p-4 border border-blue-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Electricity Bill</p>
                      <p className="text-lg md:text-2xl font-bold text-orange-600">
                        {formatCurrency(rentLog.meterBill)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6">
                    <div className="bg-white rounded-lg p-2 md:p-4 border border-blue-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Amount</p>
                      <p className="text-lg md:text-2xl font-bold text-purple-600">
                        {formatCurrency(rentLog.total)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2 md:p-4 border border-blue-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Payment Mode</p>
                      <div className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                        rentLog.paymentMode === 'cash' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {rentLog.paymentMode === 'cash' ? '💵 Cash' : '💳 Online'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6">
                    <div className="bg-white rounded-lg p-2 md:p-4 border border-blue-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Collector</p>
                      <p className="text-sm md:text-lg font-semibold text-gray-900">{rentLog.collector}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 md:p-4 border border-blue-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
                      <p className="text-sm md:text-lg font-semibold text-gray-900">{formatDate(rentLog.date)}</p>
                    </div>
                  </div>
                </div>

                {/* Meter Information */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 md:p-6 border border-green-100">
                  <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Meter Information
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-3 md:gap-6">
                    <div className="bg-white rounded-lg p-2 md:p-4 border border-green-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Previous Reading</p>
                      <p className="text-sm md:text-lg font-semibold text-gray-900">{rentLog.previousMeterReading}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 md:p-4 border border-green-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Reading</p>
                      <p className="text-sm md:text-lg font-semibold text-gray-900">{rentLog.currentMeterReading}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 md:p-4 border border-green-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Units Consumed</p>
                      <p className="text-sm md:text-lg font-semibold text-gray-900">{rentLog.units}</p>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-6">
                    <div className="bg-white rounded-lg p-2 md:p-4 border border-green-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Unit Price</p>
                      <p className="text-sm md:text-lg font-semibold text-gray-900">₹{rentLog.unitPrice} per unit</p>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {rentLog.notes && (
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 md:p-6 border border-gray-200">
                    <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6 flex items-center">
                      <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
                      Notes
                    </h4>
                    
                    <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
                      <p className="text-sm md:text-base text-gray-700 leading-relaxed">{rentLog.notes}</p>
                    </div>
                  </div>
                )}

                {/* Attachments Section */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 md:p-6 border border-gray-200">
                  <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6 flex items-center">
                    <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
                    Attachments & Files
                  </h4>
                  
                  {rentLog.attachments.length === 0 ? (
                    <div className="text-center py-6 md:py-8">
                      <FileText className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 md:mb-3" />
                      <p className="text-sm md:text-base text-gray-500">No attachments uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-2 md:space-y-3">
                      {rentLog.attachments.map(file => (
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

              {/* Right Column - File Preview */}
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
            </div>
          </div>

          {/* Mobile Send WhatsApp Button - Sticky at bottom */}
          <div className="md:hidden flex-shrink-0 border-t border-gray-200 p-4 bg-white">
            <button
              onClick={handleSendWhatsApp}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Send className="w-4 h-4 mr-2" />
              Send WhatsApp
            </button>
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
    </div>
  );
} 