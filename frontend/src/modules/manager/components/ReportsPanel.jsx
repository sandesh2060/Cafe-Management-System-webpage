// File: frontend/src/modules/manager/components/ReportsPanel.jsx
// Fully responsive Reports Panel with dark/light mode support

import { useState } from 'react';
import { useReports } from '../hooks/useReports';
import { Download, Calendar, DollarSign, ShoppingBag, TrendingUp, CreditCard } from 'lucide-react';

const ReportsPanel = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { revenueReport, loading, fetchRevenueReport, downloadReport } = useReports();

  const handleGenerateReport = () => {
    if (startDate && endDate) {
      fetchRevenueReport(startDate, endDate);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
        Reports
      </h2>

      {/* Report Generator Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Revenue Report
        </h3>
        
        {/* Date Range Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="text-gray-400" size={18} />
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="text-gray-400" size={18} />
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="sm:col-span-2 lg:col-span-1 flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={!startDate || !endDate || loading}
              className="w-full px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Generating report...
            </p>
          </div>
        )}

        {/* Report Results */}
        {!loading && revenueReport && (
          <div className="space-y-4 sm:space-y-6">
            {/* Summary Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Revenue */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">
                    Total Revenue
                  </p>
                  <DollarSign className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">
                  ${revenueReport.summary?.totalRevenue?.toFixed(2) || '0.00'}
                </p>
              </div>

              {/* Total Orders */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">
                    Total Orders
                  </p>
                  <ShoppingBag className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">
                  {revenueReport.summary?.totalOrders || 0}
                </p>
              </div>

              {/* Avg Order Value */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">
                    Avg Order Value
                  </p>
                  <TrendingUp className="text-purple-600 dark:text-purple-400" size={20} />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-100">
                  ${revenueReport.summary?.avgOrderValue?.toFixed(2) || '0.00'}
                </p>
              </div>

              {/* Cash Payments */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">
                    Cash Payments
                  </p>
                  <CreditCard className="text-orange-600 dark:text-orange-400" size={20} />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-orange-900 dark:text-orange-100">
                  ${revenueReport.summary?.cashPayments?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            {/* Download Button */}
            <div className="flex justify-end">
              <button
                onClick={() => downloadReport(startDate, endDate)}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm sm:text-base font-medium"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Download Report</span>
                <span className="sm:hidden">Download</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !revenueReport && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 dark:text-gray-600 text-4xl sm:text-5xl mb-3">
              📊
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Select a date range and click "Generate Report" to view revenue statistics
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPanel;