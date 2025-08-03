import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { AppSettings, RentCollector } from '../../types';
import { exportAllData, wipeAllData } from '../../utils/storage';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { RentLogForm } from '../rent-logs/RentLogForm';
import { 
  Settings, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Database, 
  AlertTriangle,
  Save,
  DollarSign,
  Shield,
  Calendar,
  FileText
} from 'lucide-react';

export function SettingsPage() {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const [newCollectorName, setNewCollectorName] = useState('');
  const [defaultUnitPrice, setDefaultUnitPrice] = useState(state.settings.defaultUnitPrice.toString());
  const [isDeleteCollectorOpen, setIsDeleteCollectorOpen] = useState(false);
  const [deletingCollectorId, setDeletingCollectorId] = useState<string | null>(null);
  const [isWipeDataOpen, setIsWipeDataOpen] = useState(false);
  const [isLoadDummyDataOpen, setIsLoadDummyDataOpen] = useState(false);

  const handleAddCollector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectorName.trim()) return;

    const newCollector: RentCollector = {
      id: crypto.randomUUID(),
      name: newCollectorName.trim(),
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_RENT_COLLECTOR', payload: newCollector });
    showToast(`Collector ${newCollectorName.trim()} added successfully`, 'success');
    setNewCollectorName('');
  };

  const handleDeleteCollector = (collectorId: string) => {
    setDeletingCollectorId(collectorId);
    setIsDeleteCollectorOpen(true);
  };

  const confirmDeleteCollector = () => {
    if (deletingCollectorId) {
      const collectorToDelete = state.rentCollectors.find(collector => collector.id === deletingCollectorId);
      dispatch({ type: 'DELETE_RENT_COLLECTOR', payload: deletingCollectorId });
      if (collectorToDelete) {
        showToast(`Collector ${collectorToDelete.name} deleted successfully`, 'info');
      }
      setDeletingCollectorId(null);
    }
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { defaultUnitPrice: parseFloat(defaultUnitPrice) },
    });
    showToast('Settings updated successfully!', 'success');
  };

  const handleExportData = () => {
    exportAllData();
  };

  const handleWipeData = () => {
    setIsWipeDataOpen(true);
  };

  const confirmWipeData = () => {
    wipeAllData();
    dispatch({ type: 'WIPE_ALL_DATA' });
    showToast('All data has been wiped successfully.', 'warning');
  };

  const handleLoadDummyData = () => {
    setIsLoadDummyDataOpen(true);
  };

  const confirmLoadDummyData = () => {
    dispatch({ type: 'LOAD_DUMMY_DATA' });
    showToast('Dummy data loaded successfully!', 'success');
  };

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 md:pt-28 max-w-4xl">
      {/* Desktop Sticky Header */}
      <div className="hidden md:block fixed top-0 left-64 right-0 bg-white border-b border-gray-200 z-30 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg md:text-xl font-medium text-gray-900">Settings</h1>
            <p className="text-sm font-reddit-sans-regular text-gray-600">Manage your application preferences and data</p>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden mb-4 md:mb-8">
                    <h1 className="text-lg md:text-xl font-medium text-gray-900">Settings</h1>
        <p className="text-sm md:text-base text-gray-600">Manage your application preferences and data</p>
      </div>

      {/* Rent Collectors Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-4 mb-6 md:mb-8">
        <h2 className="text-base md:text-lg font-reddit-sans-semibold text-gray-900 mb-3 md:mb-4">Rent collectors</h2>
        
        <form onSubmit={handleAddCollector} className="mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={newCollectorName}
              onChange={(e) => setNewCollectorName(e.target.value)}
              placeholder="Enter collector name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {state.rentCollectors.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No collectors added yet</p>
          ) : (
            state.rentCollectors.map(collector => (
              <div key={collector.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm md:text-base text-gray-900">{collector.name}</span>
                <button
                  onClick={() => handleDeleteCollector(collector.id)}
                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Default Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-4 mb-6 md:mb-8">
        <h2 className="text-base md:text-lg font-reddit-sans-semibold text-gray-900 mb-3 md:mb-4">Default settings</h2>
        
        <form onSubmit={handleUpdateSettings}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default unit price (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={defaultUnitPrice}
              onChange={(e) => setDefaultUnitPrice(e.target.value)}
              className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="8"
            />
            <p className="text-xs text-gray-500 mt-1">
              This value will be auto-filled when creating new rent logs
            </p>
          </div>
          
          <button
            type="submit"
            className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save settings
          </button>
        </form>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-4">
        <h2 className="text-base md:text-lg font-reddit-sans-semibold text-gray-900 mb-3 md:mb-4">Data management</h2>
        
        <div className="space-y-3 md:space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="mb-3 md:mb-0">
              <h3 className="font-medium text-green-900">Export all data</h3>
              <p className="text-xs md:text-sm text-green-700">Download all your data as a CSV file</p>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="mb-3 md:mb-0">
              <h3 className="font-medium text-blue-900">Add dummy data</h3>
              <p className="text-xs md:text-sm text-blue-700">Load sample tenants and logs for testing</p>
            </div>
            <button
              onClick={handleLoadDummyData}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Database className="w-4 h-4 mr-2" />
              Load sample data
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="mb-3 md:mb-0">
              <h3 className="font-medium text-red-900">Wipe all data</h3>
              <p className="text-xs md:text-sm text-red-700">Permanently delete all tenants, logs, and settings</p>
            </div>
            <button
              onClick={handleWipeData}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Wipe Data
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={isDeleteCollectorOpen}
        onClose={() => {
          setIsDeleteCollectorOpen(false);
          setDeletingCollectorId(null);
        }}
        onConfirm={confirmDeleteCollector}
        title="Delete collector"
        message="Are you sure you want to delete this collector? This action cannot be undone."
        confirmText="Delete collector"
        cancelText="Cancel"
        type="danger"
      />

      <ConfirmationModal
        isOpen={isWipeDataOpen}
        onClose={() => setIsWipeDataOpen(false)}
        onConfirm={confirmWipeData}
        title="Wipe all data"
        message="⚠️ WARNING: This will permanently delete ALL data including tenants, rent logs, and settings. This action cannot be undone. Are you absolutely sure?"
        confirmText="Wipe all data"
        cancelText="Cancel"
        type="danger"
        icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
      />

      <ConfirmationModal
        isOpen={isLoadDummyDataOpen}
        onClose={() => setIsLoadDummyDataOpen(false)}
        onConfirm={confirmLoadDummyData}
        title="Load sample data"
        message="This will add sample tenants and rent logs to your app. Continue?"
        confirmText="Load sample data"
        cancelText="Cancel"
        type="info"
        icon={<Database className="w-6 h-6 text-blue-600" />}
      />

    </div>
  );
}