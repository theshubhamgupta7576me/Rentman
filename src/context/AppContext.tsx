import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { Tenant, RentLog, RentCollector, AppSettings } from '../types';
import { apiService } from '../services/api';

interface AppState {
  tenants: Tenant[];
  rentLogs: RentLog[];
  rentCollectors: RentCollector[];
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'SET_TENANTS'; payload: Tenant[] }
  | { type: 'ADD_TENANT'; payload: Tenant }
  | { type: 'UPDATE_TENANT'; payload: Tenant }
  | { type: 'DELETE_TENANT'; payload: string }
  | { type: 'SET_RENT_LOGS'; payload: RentLog[] }
  | { type: 'ADD_RENT_LOG'; payload: RentLog }
  | { type: 'UPDATE_RENT_LOG'; payload: RentLog }
  | { type: 'DELETE_RENT_LOG'; payload: string }
  | { type: 'SET_RENT_COLLECTORS'; payload: RentCollector[] }
  | { type: 'ADD_RENT_COLLECTOR'; payload: RentCollector }
  | { type: 'DELETE_RENT_COLLECTOR'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: AppSettings }
  | { type: 'WIPE_ALL_DATA' }
  | { type: 'LOAD_DUMMY_DATA' };

const initialState: AppState = {
  tenants: [],
  rentLogs: [],
  rentCollectors: [],
  settings: {
    id: '1',
    defaultUnitPrice: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  isLoading: false,
  error: null,
  isConnected: false,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  refreshData: () => Promise<void>;
  checkConnection: () => Promise<void>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
    case 'SET_TENANTS':
      return { ...state, tenants: action.payload };
    case 'ADD_TENANT':
      return { ...state, tenants: [...state.tenants, action.payload] };
    case 'UPDATE_TENANT':
      return {
        ...state,
        tenants: state.tenants.map(t => t.id === action.payload.id ? action.payload : t),
      };
    case 'DELETE_TENANT':
      return {
        ...state,
        tenants: state.tenants.filter(t => t.id !== action.payload),
        rentLogs: state.rentLogs.filter(log => log.tenantId !== action.payload),
      };
    case 'SET_RENT_LOGS':
      return { ...state, rentLogs: action.payload };
    case 'ADD_RENT_LOG':
      return { ...state, rentLogs: [...state.rentLogs, action.payload] };
    case 'UPDATE_RENT_LOG':
      return {
        ...state,
        rentLogs: state.rentLogs.map(log => log.id === action.payload.id ? action.payload : log),
      };
    case 'DELETE_RENT_LOG':
      return {
        ...state,
        rentLogs: state.rentLogs.filter(log => log.id !== action.payload),
      };
    case 'SET_RENT_COLLECTORS':
      return { ...state, rentCollectors: action.payload };
    case 'ADD_RENT_COLLECTOR':
      return { ...state, rentCollectors: [...state.rentCollectors, action.payload] };
    case 'DELETE_RENT_COLLECTOR':
      return {
        ...state,
        rentCollectors: state.rentCollectors.filter(c => c.id !== action.payload),
      };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    case 'WIPE_ALL_DATA':
      return initialState;
    case 'LOAD_DUMMY_DATA':
      return {
        ...state,
        ...generateDummyData(),
      };
    default:
      return state;
  }
}

function generateDummyData(): Partial<AppState> {
  const dummyCollectors: RentCollector[] = [
    { id: '1', name: 'John Doe', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '2', name: 'Jane Smith', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '3', name: 'Mike Johnson', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  const dummyTenants: Tenant[] = [
    {
      id: '1',
      name: 'Priya Sharma',
      propertyName: 'Sunrise Apartment 2A',
      monthlyRent: 15000,
      securityDeposit: 30000,
      startDate: '2024-01-01',
      startMeterReading: '1250',
      propertyType: 'residential',
      phoneNumber: '+919876543210',
      notes: 'Long-term tenant, always pays on time.',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Rajesh Kumar',
      propertyName: 'Garden View 1B',
      monthlyRent: 12000,
      securityDeposit: 24000,
      startDate: '2024-02-15',
      startMeterReading: '980',
      propertyType: 'residential',
      phoneNumber: '+919876543211',
      notes: 'Young professional, prefers digital payments.',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const dummyRentLogs: RentLog[] = [
    {
      id: '1',
      tenantId: '1',
      tenantName: 'Priya Sharma',
      date: '2025-01-31',
      rentPaid: 15000,
      previousMeterReading: 1250,
      currentMeterReading: 1380,
      units: 130,
      unitPrice: 8,
      meterBill: 1040,
      total: 16040,
      collector: 'John Doe',
      paymentMode: 'cash',
      notes: 'January payment received on time',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      tenantId: '2',
      tenantName: 'Rajesh Kumar',
      date: '2025-01-31',
      rentPaid: 12000,
      previousMeterReading: 980,
      currentMeterReading: 1095,
      units: 115,
      unitPrice: 8,
      meterBill: 920,
      total: 12920,
      collector: 'Jane Smith',
      paymentMode: 'online',
      notes: 'January payment - online transfer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return {
    tenants: dummyTenants,
    rentLogs: dummyRentLogs,
    rentCollectors: dummyCollectors,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Check connection status
  const checkConnection = async () => {
    try {
      const isConnected = await apiService.isConnected();
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: isConnected });
    } catch (error) {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
    }
  };

  // Refresh all data from API
  const refreshData = async () => {
    if (!state.isConnected) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Load tenants
      const tenantsResponse = await apiService.getAllTenants();
      if (tenantsResponse.success && tenantsResponse.data) {
        dispatch({ type: 'SET_TENANTS', payload: tenantsResponse.data });
      }

      // Load rent logs
      const rentLogsResponse = await apiService.getAllRentLogs();
      if (rentLogsResponse.success && rentLogsResponse.data) {
        dispatch({ type: 'SET_RENT_LOGS', payload: rentLogsResponse.data });
      }

      // Load rent collectors
      const collectorsResponse = await apiService.getAllRentCollectors();
      if (collectorsResponse.success && collectorsResponse.data) {
        dispatch({ type: 'SET_RENT_COLLECTORS', payload: collectorsResponse.data });
      }

      // Load settings
      const settingsResponse = await apiService.getAppSettings();
      if (settingsResponse.success && settingsResponse.data) {
        dispatch({ type: 'UPDATE_SETTINGS', payload: settingsResponse.data });
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data from server' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Initialize data on mount
  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (state.isConnected) {
      refreshData();
    }
  }, [state.isConnected]);

  return (
    <AppContext.Provider value={{ state, dispatch, refreshData, checkConnection }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}