// File: frontend/src/modules/manager/components/InventoryOverview.jsx
// Fully responsive Inventory Overview with dark/light mode support

import { useEffect } from 'react';
import { useInventory } from '../hooks/useInventory';
import { AlertTriangle, Package, RefreshCw, Search } from 'lucide-react';

const InventoryOverview = () => {
  const { inventory, stats, loading, fetchInventory } = useInventory();

  useEffect(() => {
    fetchInventory();
  }, []);

  const getStatusBadge = (item) => {
    if (item.stock === 0) {
      return (
        <span className="px-2 sm:px-3 py-1 text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full border border-red-200 dark:border-red-800">
          Out of Stock
        </span>
      );
    } else if (item.stock < item.reorderLevel) {
      return (
        <span className="px-2 sm:px-3 py-1 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full border border-yellow-200 dark:border-yellow-800">
          Low Stock
        </span>
      );
    }
    return (
      <span className="px-2 sm:px-3 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800">
        In Stock
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Inventory Overview
        </h2>
        <button
          onClick={fetchInventory}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Items */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Total Items
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">
                {stats?.total || 0}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Package className="text-blue-500" size={24} />
            </div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Low Stock
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-500 mt-1 sm:mt-2">
                {stats?.lowStockCount || 0}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-yellow-500" size={24} />
            </div>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Out of Stock
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-500 mt-1 sm:mt-2">
                {stats?.outOfStockCount || 0}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Loading inventory...
            </p>
          </div>
        ) : inventory && inventory.length > 0 ? (
          <>
            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reorder Level
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {inventory.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {item.category}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                        {item.stock}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {item.reorderLevel}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(item)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (visible on mobile only) */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {inventory.map((item) => (
                <div key={item._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.category}
                      </p>
                    </div>
                    {getStatusBadge(item)}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Current Stock
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                        {item.stock}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Reorder Level
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                        {item.reorderLevel}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="text-4xl sm:text-5xl text-gray-400 dark:text-gray-600 mb-3">
              📦
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              No inventory items found
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-2">
              Add items to start tracking your inventory
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryOverview;