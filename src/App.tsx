import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { Navigation } from './components/common/Navigation';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { TenantsPage } from './components/tenants/TenantsPage';
import { RentLogsPage } from './components/rent-logs/RentLogsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { TenantDetailsPage } from './components/tenants/TenantDetailsPage';
import { RentLogDetailsPage } from './components/rent-logs/RentLogDetailsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const renderPage = () => {
    // Handle detail pages
    if (currentPage === 'tenant-details' && selectedTenantId) {
      return <TenantDetailsPage tenantId={selectedTenantId} onBack={() => setCurrentPage('tenants')} />;
    }
    
    if (currentPage === 'log-details' && selectedLogId) {
      return <RentLogDetailsPage logId={selectedLogId} onBack={() => setCurrentPage('rent-logs')} />;
    }

    // Handle main pages
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'tenants':
        return <TenantsPage onTenantSelect={(tenantId) => {
          setSelectedTenantId(tenantId);
          setCurrentPage('tenant-details');
        }} />;
      case 'rent-logs':
        return <RentLogsPage onLogSelect={(logId) => {
          setSelectedLogId(logId);
          setCurrentPage('log-details');
        }} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AppProvider>
      <ToastProvider>
        <div className="flex min-h-screen bg-gray-50">
          <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
          <main className="flex-1 overflow-auto md:ml-64 pt-16 md:pt-0 pb-4 md:pb-0">
            {renderPage()}
          </main>
        </div>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;