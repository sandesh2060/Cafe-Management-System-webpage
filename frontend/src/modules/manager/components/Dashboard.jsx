// File: frontend/src/modules/manager/components/Dashboard.jsx
// Fully responsive Dashboard component with dark/light mode support

import { useEffect } from 'react';
import { Activity, DollarSign, ShoppingBag, Users, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';

const StatCard = ({ icon: Icon, title, value, trend, color, subtitle }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
          {title}
        </p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2 text-xs sm:text-sm">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">{trend}%</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
          </div>
        )}
      </div>
      <div className={`${color} p-2 sm:p-3 rounded-lg sm:rounded-xl ml-3 flex-shrink-0`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { stats, loading, error, refreshStats } = useDashboard();

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 sm:h-96">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-sm sm:text-base font-medium text-red-900 dark:text-red-200">
              Error Loading Dashboard
            </h3>
            <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-1">
              {error}
            </p>
            <button
              onClick={refreshStats}
              className="mt-3 text-xs sm:text-sm text-red-700 dark:text-red-300 hover:underline font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Manager Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Real-time overview of your restaurant operations
          </p>
        </div>
        <button
          onClick={refreshStats}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          icon={DollarSign}
          title="Today's Sales"
          value={`$${stats?.todaySales?.toFixed(2) || '0.00'}`}
          trend={12}
          color="bg-green-500"
        />
        <StatCard
          icon={ShoppingBag}
          title="Active Orders"
          value={stats?.activeOrders || 0}
          color="bg-blue-500"
          subtitle={`${stats?.completedToday || 0} completed today`}
        />
        <StatCard
          icon={Users}
          title="Staff Online"
          value={`${stats?.onlineStaff || 0}/${stats?.totalStaff || 0}`}
          color="bg-purple-500"
          subtitle="staff members"
        />
        <StatCard
          icon={Activity}
          title="Active Tables"
          value={`${stats?.activeTables || 0}/${stats?.totalTables || 0}`}
          color="bg-orange-500"
          subtitle="tables occupied"
        />
      </div>

      {/* Low Inventory Alert */}
      {stats?.lowInventoryItems > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-medium text-yellow-900 dark:text-yellow-200">
                Low Inventory Alert
              </h3>
              <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                {stats.lowInventoryItems} {stats.lowInventoryItems === 1 ? 'item is' : 'items are'} low in stock and need to be reordered.
              </p>
              <button className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 hover:underline mt-2 font-medium">
                View Inventory →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Activity className="text-blue-500" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Activity className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Overview
          </h3>
          <div className="space-y-4">
            {/* Average Wait Time */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Average Wait Time
                </span>
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  {stats?.avgWaitTime || '0'} min
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((stats?.avgWaitTime || 0) / 30 * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Order Completion Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Order Completion Rate
                </span>
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  {stats?.completionRate || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats?.completionRate || 0}%` }}
                />
              </div>
            </div>

            {/* Table Turnover */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Table Turnover Rate
                </span>
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  {stats?.tableTurnover || 0}/day
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((stats?.tableTurnover || 0) / 10 * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;