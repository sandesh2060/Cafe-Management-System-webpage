// File: frontend/src/modules/manager/components/TableManagement.jsx

import { useState } from 'react';
import { Plus, QrCode, Trash2, RefreshCw, MapPin, Users as UsersIcon } from 'lucide-react';
import { useTableManagement } from '../hooks/useTableManagement';
import CreateTableModal from './CreateTableModal';
import QRCodeDisplay from './QRCodeDisplay';

const TableManagement = () => {
  const {
    tables,
    stats,
    loading,
    deleteTable,
    regenerateQR,
    updateFilters,
    filters
  } = useTableManagement();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showQR, setShowQR] = useState(null);

  console.log('🎨 Rendering TableManagement, tables:', tables);

  const handleDelete = async (tableId, tableNumber) => {
    if (window.confirm(`Delete Table ${tableNumber}? This action cannot be undone.`)) {
      try {
        await deleteTable(tableId);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handleRegenerateQR = async (table) => {
    try {
      const result = await regenerateQR(table._id);
      setShowQR({ table, qrCodeImage: result.qrCodeImage });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleShowQR = (table) => {
    setShowQR({ table, qrCodeImage: table.qrCode });
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-500/20 text-green-400 border-green-500/30',
      occupied: 'bg-red-500/20 text-red-400 border-red-500/30',
      reserved: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tables</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <UsersIcon className="text-blue-500" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                <p className="text-2xl font-bold text-green-400 mt-1">
                  {stats.available}
                </p>
              </div>
              <div className="text-green-400 text-3xl">✓</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Occupied</p>
                <p className="text-2xl font-bold text-red-400 mt-1">
                  {stats.occupied}
                </p>
              </div>
              <div className="text-red-400 text-3xl">●</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Occupancy Rate</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">
                  {stats.occupancyRate}%
                </p>
              </div>
              <div className="text-blue-400 text-2xl">📊</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
          </select>

          {/* Add Table Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Table
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tables...</p>
          </div>
        ) : tables.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🪑</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">No tables found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              Create your first table to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Add Table
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
            {tables.map((table) => (
              <div
                key={table._id}
                className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-all group"
              >
                {/* Table Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Table {table.number}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <UsersIcon size={14} />
                      <span>{table.capacity} seats</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(table.status)}`}>
                    {table.status}
                  </span>
                </div>

                {/* Location (if available) */}
                {table.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500 mb-3">
                    <MapPin size={12} />
                    <span>
                      {table.location.coordinates[1].toFixed(4)}, {table.location.coordinates[0].toFixed(4)}
                    </span>
                  </div>
                )}

                {/* Current Customer (if occupied) */}
                {table.currentCustomer && (
                  <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs">
                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                      👤 {table.currentCustomer.name || table.currentCustomer.phoneNumber}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShowQR(table)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    title="View QR Code"
                  >
                    <QrCode size={16} />
                    QR
                  </button>
                  <button
                    onClick={() => handleRegenerateQR(table)}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    title="Regenerate QR Code"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(table._id, table.number)}
                    disabled={table.status === 'occupied'}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={table.status === 'occupied' ? 'Cannot delete occupied table' : 'Delete Table'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Table Modal */}
      {showCreateModal && (
        <CreateTableModal
          onClose={() => {
            console.log('🚪 Closing create modal');
            setShowCreateModal(false);
          }}
          onSuccess={(result) => {
            console.log('✅ onSuccess received:', result);
            setShowCreateModal(false);
            
            // Show QR if available
            if (result?.table) {
              setShowQR({ 
                table: result.table, 
                qrCodeImage: result.qrCodeImage || result.table.qrCode 
              });
            } else {
              console.warn('⚠️ No table in result:', result);
            }
          }}
        />
      )}

      {/* QR Code Display Modal */}
      {showQR && (
        <QRCodeDisplay
          table={showQR.table}
          qrCodeImage={showQR.qrCodeImage}
          onClose={() => setShowQR(null)}
        />
      )}
    </div>
  );
};

export default TableManagement;