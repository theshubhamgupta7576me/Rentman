import React, { useState } from 'react';
import { Plus, DollarSign, Zap, Users, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DateFilter, DateRange } from '../../types';
import { useAnalytics } from '../../hooks/useAnalytics';
import { StatCard } from './StatCard';
import { SimpleChart } from './SimpleChart';
import { RentLogForm } from '../rent-logs/RentLogForm';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/dateUtils';

export function DashboardPage() {
  const { state, dispatch } = useApp();
  const [dateFilter, setDateFilter] = useState<DateFilter>('30days');
  const [customRange, setCustomRange] = useState<DateRange>({ start: '', end: new Date().toISOString().split('T')[0] });
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  
  const { stats, chartData, recentLogs } = useAnalytics(dateFilter, customRange);

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

  const pendingTenants = getPendingPayments();
  
  // Calculate total pending amount
  const totalPendingAmount = pendingTenants.reduce((total, tenantName) => {
    const tenant = state.tenants.find(t => t.name === tenantName);
    return total + (tenant?.monthlyRent || 0);
  }, 0);

  const handleQuickLog = (logData: any) => {
    const newLog = {
      ...logData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_RENT_LOG', payload: newLog });
    setIsLogModalOpen(false);
  };

  return (
    <div className="pt-4 px-4 pb-20 md:pb-6 md:p-6 md:pt-28">
      {/* Desktop Sticky Header */}
      <div className="hidden md:block fixed top-0 left-64 right-0 bg-white border-b border-gray-200 z-30 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg md:text-xl font-medium text-gray-900">Dashboard</h1>
            <p className="text-sm font-reddit-sans-regular text-gray-600">Overview of your rental business</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Quick log rent
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-start mb-4 md:mb-6">
        <div>
                      <h1 className="text-lg md:text-xl font-medium text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Overview of your rental business</p>
        </div>
      </div>

      {/* Date Filter Tabs */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="inline-flex space-x-1 bg-gray-100 p-0.5 md:p-1 rounded-lg w-fit">
            {[
              { value: '30days', label: 'This month' },
              { value: '6months', label: 'Last 6 months' },
              { value: '1year', label: 'This year' },
              { value: 'custom', label: 'Custom' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setDateFilter(option.value as DateFilter)}
                className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-colors ${
                  dateFilter === option.value
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {dateFilter === 'custom' && (
            <>
              {/* Desktop Divider */}
              <div className="hidden md:block w-px h-8 bg-gray-300"></div>
              
              {/* Desktop Date Inputs */}
              <div className="hidden md:flex gap-2 md:gap-4">
                <input
                  type="date"
                  value={customRange.start}
                  onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') return;
                    if (!/[\d-]/.test(e.key)) e.preventDefault();
                  }}
                  max="9999-12-31"
                  className="px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text"
                />
                <input
                  type="date"
                  value={customRange.end}
                  onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') return;
                    if (!/[\d-]/.test(e.key)) e.preventDefault();
                  }}
                  max="9999-12-31"
                  className="px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text"
                />
              </div>
              
              {/* Mobile Date Inputs */}
              <div className="md:hidden flex gap-2 md:gap-4 mt-4">
                <input
                  type="date"
                  value={customRange.start}
                  onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') return;
                    if (!/[\d-]/.test(e.key)) e.preventDefault();
                  }}
                  max="9999-12-31"
                  className="px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text"
                />
                <input
                  type="date"
                  value={customRange.end}
                  onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') return;
                    if (!/[\d-]/.test(e.key)) e.preventDefault();
                  }}
                  max="9999-12-31"
                  className="px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text"
                />
              </div>
            </>
          )}
        </div>
      </div>



      {/* Money Collection and Pending Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Total Money Collected */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Money Collected</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRentCollected + stats.totalElectricityBill)}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-lg md:text-2xl">₹</span>
            </div>
          </div>
          
          {/* Breakdown */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Total Rent</span>
              </div>
              <span className="text-sm font-semibold text-blue-600">{formatCurrency(stats.totalRentCollected)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Electricity Bill</span>
              </div>
              <span className="text-sm font-semibold text-orange-600">{formatCurrency(stats.totalElectricityBill)}</span>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPendingAmount)}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          {/* Pending Tenants List */}
          {pendingTenants.length > 0 ? (
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Pending Properties</span>
                </div>
                <span className="text-sm font-semibold text-red-600">{pendingTenants.length}</span>
              </div>
              <button
                onClick={() => setIsPendingModalOpen(true)}
                className="w-full text-sm text-red-600 hover:text-red-700 font-medium py-2 px-3 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
              >
                View all pending properties
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">All tenants have paid this month</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
          <h3 className="text-base md:text-lg font-reddit-sans-semibold text-gray-900 mb-3 md:mb-4">Rent collection trend</h3>
          <SimpleChart data={chartData.rentTrend} type="rent" />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
          <h3 className="text-base md:text-lg font-reddit-sans-semibold text-gray-900 mb-3 md:mb-4">Electricity bill trend</h3>
          <SimpleChart data={chartData.electricityTrend} type="electricity" />
        </div>
      </div>

      {/* Recent Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-3 md:px-6 py-3 md:py-4 border-b border-gray-200">
          <h3 className="text-base md:text-lg font-reddit-sans-semibold text-gray-900">Recent rent logs</h3>
        </div>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentLogs.slice(0, 10).map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-3 md:px-4 py-3 whitespace-nowrap sticky left-0 bg-white z-10 shadow-2xl border-r border-gray-200">
                    <div className="text-sm font-bold text-gray-900 truncate max-w-[120px]">
                      {(() => {
                        const tenant = state.tenants.find(t => t.id === log.tenantId);
                        return tenant?.propertyName || log.tenantName;
                      })()}
                    </div>
                  </td>
                  <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(log.date)}</div>
                  </td>
                  <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      {formatCurrency(log.rentPaid)}
                    </div>
                  </td>
                  <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {log.previousMeterReading} → {log.currentMeterReading}
                    </div>
                  </td>
                  <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.units}</div>
                  </td>
                  <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-orange-600">
                      {formatCurrency(log.meterBill)}
                    </div>
                  </td>
                  <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-semibold text-blue-600">
                      {formatCurrency(log.total)}
                    </div>
                  </td>
                  <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      log.paymentMode === 'online'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {log.paymentMode === 'online' ? 'Online' : 'Cash'}
                    </div>
                  </td>
                  <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 truncate max-w-[100px]">{log.collector}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>



      {/* Mobile Floating Action Button */}
      <button
        onClick={() => setIsLogModalOpen(true)}
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-50"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Rent Log Modal */}
      {isLogModalOpen && (
        <Modal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          title="Quick Log Rent"
          size="lg"
          buttons={
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="rent-log-form"
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Log
              </button>
            </div>
          }
        >
          <RentLogForm
            onSubmit={handleQuickLog}
            onCancel={() => setIsLogModalOpen(false)}
          />
        </Modal>
      )}

      {/* Pending Properties Modal */}
      {isPendingModalOpen && (
        <Modal
          isOpen={isPendingModalOpen}
          onClose={() => setIsPendingModalOpen(false)}
          title="Pending Properties"
          size="md"
          buttons={
            <div className="flex">
              <button
                type="button"
                onClick={() => setIsPendingModalOpen(false)}
                className="flex-1 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              {pendingTenants.length} properties have pending payments for this month
            </div>
            <div className="space-y-3">
              {pendingTenants.map((tenantName) => {
                const tenant = state.tenants.find(t => t.name === tenantName);
                const propertyName = tenant?.propertyName || tenantName;
                const monthlyRent = tenant?.monthlyRent || 0;
                return (
                  <div key={tenantName} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">{propertyName}</div>
                      <div className="text-sm text-gray-600">{tenantName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">{formatCurrency(monthlyRent)}</div>
                      <div className="text-xs text-gray-500">Monthly rent</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}