import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, FileText, Calendar, Send, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { RentLog } from '../../types';
import { RentLogForm } from './RentLogForm';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { RentLogDetailsModal } from './RentLogDetailsModal';
import { formatCurrency, formatDate } from '../../utils/dateUtils';

type ViewType = 'table' | 'cards';

interface RentLogsPageProps {
  onLogSelect?: (logId: string) => void;
}

export function RentLogsPage({ onLogSelect }: RentLogsPageProps) {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState<ViewType>('cards');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<RentLog | undefined>();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const [viewingLog, setViewingLog] = useState<RentLog | undefined>();
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [selectedCollector, setSelectedCollector] = useState<string>('');

  const filteredLogs = state.rentLogs.filter(log => {
      // Property filter
  const matchesTenant = !selectedTenant || (() => {
    const tenant = state.tenants.find(t => t.id === log.tenantId);
    return (tenant?.propertyName || log.tenantName) === selectedTenant;
  })();
    
    // Collector filter
    const matchesCollector = !selectedCollector || log.collector === selectedCollector;
    
    return matchesTenant && matchesCollector;
  });

  const sortedLogs = filteredLogs.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleAddLog = (logData: Omit<RentLog, 'id' | 'createdAt'>) => {
    const newLog: RentLog = {
      ...logData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_RENT_LOG', payload: newLog });
    showToast(`Rent log added successfully for ${logData.tenantName}`, 'success');
    setIsModalOpen(false);
  };

  const handleUpdateLog = (logData: Omit<RentLog, 'id' | 'createdAt'>) => {
    if (editingLog) {
      const updatedLog: RentLog = {
        ...logData,
        id: editingLog.id,
        createdAt: editingLog.createdAt,
      };
      dispatch({ type: 'UPDATE_RENT_LOG', payload: updatedLog });
      showToast(`Rent log updated successfully for ${logData.tenantName}`, 'success');
      setEditingLog(undefined);
      setIsModalOpen(false);
    }
  };

  const handleDeleteLog = (logId: string) => {
    setDeletingLogId(logId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteLog = () => {
    if (deletingLogId) {
      const logToDelete = state.rentLogs.find(log => log.id === deletingLogId);
      dispatch({ type: 'DELETE_RENT_LOG', payload: deletingLogId });
      if (logToDelete) {
        showToast(`Rent log deleted successfully for ${logToDelete.tenantName}`, 'info');
      }
      setDeletingLogId(null);
    }
  };

  const openAddModal = () => {
    setEditingLog(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (log: RentLog) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLog(undefined);
  };

  const openDetailsModal = (log: RentLog) => {
    if (onLogSelect) {
      onLogSelect(log.id);
    } else {
      setViewingLog(log);
    }
  };

  const closeDetailsModal = () => {
    setViewingLog(undefined);
  };

  // Calculate stats for this month
  const getCurrentMonthStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonthLogs = state.rentLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
    });

    const totalMoneyCollected = thisMonthLogs.reduce((sum, log) => sum + log.total, 0);
    const totalRentCollected = thisMonthLogs.reduce((sum, log) => sum + log.rentPaid, 0);
    const totalElectricityBill = thisMonthLogs.reduce((sum, log) => sum + log.meterBill, 0);

    return {
      totalMoneyCollected,
      totalRentCollected,
      totalElectricityBill
    };
  };

  // Get pending payments (tenants who haven't paid this month)
  const getPendingPayments = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get active tenants only (exclude archived tenants)
    const activeTenants = state.tenants.filter(tenant => !tenant.isArchived);
    
    // Get tenants who have paid this month
    const paidTenants = new Set(
      state.rentLogs
        .filter(log => {
          const logDate = new Date(log.date);
          return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
        })
        .map(log => log.tenantName)
    );
    
    // Get active tenants who haven't paid this month
    const pendingTenants = activeTenants
      .map(tenant => tenant.name)
      .filter(tenantName => !paidTenants.has(tenantName));
    
    return pendingTenants;
  };

  const stats = getCurrentMonthStats();
  const pendingTenants = getPendingPayments();

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 md:pt-28">
      {/* Desktop Sticky Header */}
      <div className="hidden md:block fixed top-0 left-64 right-0 bg-white border-b border-gray-200 z-30 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg md:text-xl font-medium text-gray-900">Rent Logs</h1>
            <p className="text-sm font-reddit-sans-regular text-gray-600">Track monthly rent and electricity payments</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add rent log
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center mb-4 md:mb-6">
        <div>
                      <h1 className="text-lg md:text-xl font-medium text-gray-900">Rent Logs</h1>
          <p className="text-sm text-gray-600">Track monthly rent and electricity payments</p>
        </div>
      </div>

      {/* View Type Tabs */}
      <div className="mb-4 md:mb-6">
        <div className="inline-flex space-x-1 bg-gray-100 p-0.5 md:p-1 rounded-lg">
          <button
            onClick={() => setViewType('cards')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-colors ${
              viewType === 'cards'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="hidden sm:inline">Card view</span>
            <span className="sm:hidden">Cards</span>
          </button>
          <button
            onClick={() => setViewType('table')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-colors ${
              viewType === 'table'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <span className="hidden sm:inline">Table view</span>
            <span className="sm:hidden">Table</span>
          </button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Tenant Filter */}
          <div className="flex-1 md:flex-none">
            <label className="block text-xs font-medium text-gray-700 mb-1">Property</label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Properties</option>
              {Array.from(new Set(state.rentLogs.map(log => {
                const tenant = state.tenants.find(t => t.id === log.tenantId);
                return tenant?.propertyName || log.tenantName;
              }))).map(property => (
                <option key={property} value={property}>{property}</option>
              ))}
            </select>
          </div>

          {/* Collector Filter */}
          <div className="flex-1 md:flex-none">
            <label className="block text-xs font-medium text-gray-700 mb-1">Collector</label>
            <select
              value={selectedCollector}
              onChange={(e) => setSelectedCollector(e.target.value)}
              className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Collectors</option>
              {Array.from(new Set(state.rentLogs.map(log => log.collector))).map(collector => (
                <option key={collector} value={collector}>{collector}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {(selectedTenant || selectedCollector) && (
            <button
              onClick={() => {
                setSelectedTenant('');
                setSelectedCollector('');
              }}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>



      {sortedLogs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FileText className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rent logs found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No logs match your search criteria.' : 'Start by adding your first rent log.'}
          </p>
          {!searchTerm && (
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add your first log
            </button>
          )}
        </div>
      ) : viewType === 'table' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 shadow-lg whitespace-nowrap border-r border-gray-200">
                    Property
                  </th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Date
                  </th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Rent Paid
                  </th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Meter
                  </th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Units
                  </th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Electricity
                  </th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Total
                  </th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Payment Mode
                  </th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Collector
                  </th>
                  <th className="px-3 md:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedLogs.map(log => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => openDetailsModal(log)}
                  >
                    <td className="px-3 md:px-4 py-4 whitespace-nowrap sticky left-0 bg-white z-10 shadow-2xl border-r border-gray-200">
                      <div className="text-sm font-bold text-gray-900 truncate max-w-[120px]">
                        {(() => {
                          const tenant = state.tenants.find(t => t.id === log.tenantId);
                          return tenant?.propertyName || log.tenantName;
                        })()}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(log.date)}</div>
                    </td>
                    <td className="px-3 md:px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(log.rentPaid)}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {log.previousMeterReading} → {log.currentMeterReading}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.units}</div>
                    </td>
                    <td className="px-3 md:px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-orange-600">
                        {formatCurrency(log.meterBill)}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-blue-600">
                        {formatCurrency(log.total)}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        log.paymentMode === 'online'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.paymentMode === 'online' ? 'Online' : 'Cash'}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 truncate max-w-[100px]">{log.collector}</div>
                    </td>
                    <td className="px-3 md:px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openEditModal(log)}
                          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedLogs.map(log => (
            <div key={log.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDetailsModal(log)}>
              {/* Header with tenant name, date, and payment mode */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {(() => {
                        const tenant = state.tenants.find(t => t.id === log.tenantId);
                        return tenant?.propertyName || log.tenantName;
                      })()}
                    </h3>
                    <p className="text-sm text-gray-600">{formatDate(log.date)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                  </div>
                </div>
              </div>

              {/* Main content - organized sections */}
              <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                {/* Payment Information Section */}
                <div className="rounded-xl p-3 md:p-4 border border-gray-200">
                  <h4 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3 flex items-center">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full mr-2"></span>
                    Payment information
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                    <div className="mb-3 md:mb-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rent Paid</p>
                      <p className="text-sm md:text-lg font-bold text-green-600">{formatCurrency(log.rentPaid)}</p>
                    </div>
                    <div className="mb-3 md:mb-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Electricity Bill</p>
                      <p className="text-sm md:text-lg font-bold text-orange-600">{formatCurrency(log.meterBill)}</p>
                    </div>
                    <div className="mb-3 md:mb-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Amount</p>
                      <p className="text-sm md:text-lg font-bold text-purple-600">{formatCurrency(log.total)}</p>
                    </div>
                    <div className="mb-3 md:mb-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Payment Mode</p>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        log.paymentMode === 'cash' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {log.paymentMode === 'cash' ? 'Cash' : 'Online'}
                      </div>
                    </div>
                    <div className="mb-3 md:mb-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Collector</p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">{log.collector}</p>
                    </div>
                    <div className="mb-3 md:mb-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">{formatDate(log.date)}</p>
                    </div>
                    {log.notes && (
                      <>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                          <p className="text-xs md:text-sm text-gray-700">{log.notes}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Meter Information Section */}
                <div className="rounded-xl p-3 md:p-4 border border-gray-200">
                  <h4 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3 flex items-center">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full mr-2"></span>
                    Meter information
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                    <div className="mb-3 md:mb-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Previous Reading</p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">{log.previousMeterReading}</p>
                    </div>
                    <div className="mb-3 md:mb-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Reading</p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">{log.currentMeterReading}</p>
                    </div>
                    <div className="mb-3 md:mb-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Units Consumed</p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">{log.units}</p>
                    </div>
                    <div className="mb-3 md:mb-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Unit Price</p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">₹{log.unitPrice} per unit</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with WhatsApp button and action icons */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // WhatsApp functionality
                      const message = `Rent received for ${formatDate(log.date)} – ${log.tenantName}
Rent: ${formatCurrency(log.rentPaid)}
Meter: ${log.previousMeterReading} → ${log.currentMeterReading}
Units: ${log.units} @ ₹${log.unitPrice}/unit
Meter Bill: ${formatCurrency(log.meterBill)}
Total Received: ${formatCurrency(log.total)}`;
                      const encodedMessage = encodeURIComponent(message);
                      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send WhatsApp
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(log);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLog(log.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Floating Action Button */}
      <button
        onClick={openAddModal}
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-50"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modals */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingLog ? 'Edit rent log' : 'Add new rent log'}
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
                form="rent-log-form"
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingLog ? 'Update log' : 'Add log'}
              </button>
            </div>
          }
        >
          <RentLogForm
            rentLog={editingLog}
            onSubmit={editingLog ? handleUpdateLog : handleAddLog}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {viewingLog && (
        <RentLogDetailsModal
          rentLog={viewingLog}
          isOpen={true}
          onClose={closeDetailsModal}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteLog}
        title="Delete rent log"
        message="Are you sure you want to delete this rent log? This action cannot be undone."
        confirmText="Delete log"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}