// ============================================
// FILE: frontend/src/modules/manager/components/SalesAnalytics.jsx
// 🎯 Sales Analytics - Works without recharts
// ============================================

import { useState, useEffect } from 'react';
import { useSalesAnalytics } from '../hooks/useSalesAnalytics';

const SalesAnalytics = () => {
  const [period, setPeriod] = useState('week');
  const { salesData, categoryData, loading, fetchAnalytics } = useSalesAnalytics();

  useEffect(() => {
    fetchAnalytics(period);
  }, [period, fetchAnalytics]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Analytics</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Revenue Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Revenue Trend</h3>
            
            {salesData && salesData.length > 0 ? (
              <div className="space-y-4">
                {salesData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-700 dark:text-gray-300">{item._id}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${item.revenue?.toFixed(2) || 0}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-lg">📊 No sales data available</p>
                <p className="text-sm mt-2">Charts will appear here when data is available</p>
              </div>
            )}
          </div>

          {/* Category Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Category Performance</h3>
            
            {categoryData && categoryData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryData.map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item._id}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      ${item.revenue?.toFixed(2) || 0}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {item.count || 0} orders
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-lg">📈 No category data available</p>
                <p className="text-sm mt-2">Category performance will appear here</p>
              </div>
            )}
          </div>

          {/* Install recharts notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              💡 <strong>Tip:</strong> Install <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">npm install recharts</code> to enable interactive charts
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesAnalytics;