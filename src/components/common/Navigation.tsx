import { Users, FileText, BarChart3, Settings, Home, User } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, mobileIcon: Home },
  { id: 'rent-logs', label: 'Rent Logs', icon: FileText, mobileIcon: FileText },
  { id: 'tenants', label: 'Tenants', icon: Users, mobileIcon: Users },
];

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  
  return (
    <>
      {/* Desktop/Tablet Sidebar Navigation */}
      <nav className="hidden md:block bg-white border-r border-gray-200 w-64 min-h-screen p-4 fixed top-0 left-0 h-screen overflow-y-auto">
        <div className="mb-8 pb-4 border-b border-gray-200 -mx-4 px-4">
          <div className="flex justify-start pl-4">
            <img src="/rentman-logo.png?v=1" alt="Rentman Logo" className="w-32 h-12" style={{objectFit: 'contain'}} />
          </div>
        </div>
        
        <ul className="space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  {item.label}
                </button>
              </li>
            );
          })}
          {/* Settings for desktop */}
          <li>
            <button
              onClick={() => onPageChange('settings')}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'settings'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Settings className={`w-5 h-5 mr-3 ${currentPage === 'settings' ? 'text-blue-700' : 'text-gray-500'}`} />
              Settings
            </button>
          </li>
        </ul>
        
        {/* Profile Section at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center pl-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Rentman</p>
              <p className="text-xs text-gray-500">LANDLORD</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between h-full">
          <img src="/rentman-logo.png?v=1" alt="Rentman Logo" className="w-32 h-12" style={{objectFit: 'contain'}} />
          <button
            onClick={() => onPageChange('settings')}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors flex items-center"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center px-2 py-2">
          {navItems.map(item => {
            const Icon = item.mobileIcon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-0 flex-1 ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}