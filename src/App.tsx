import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { Navigation } from './components/common/Navigation';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { TenantsPage } from './components/tenants/TenantsPage';
import { RentLogsPage } from './components/rent-logs/RentLogsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { TenantDetailsPage } from './components/tenants/TenantDetailsPage';
import { RentLogDetailsPage } from './components/rent-logs/RentLogDetailsPage';
import { LoginPage } from './components/auth/LoginPage';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 overflow-auto md:ml-64 pt-16 md:pt-0 pb-4 md:pb-0">
        {renderPage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;