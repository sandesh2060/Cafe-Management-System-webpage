// File: frontend/src/modules/manager/pages/DashboardPage.jsx
// ✅ UPDATED: Added NotificationBell component

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Table2, 
  Menu,
  X
} from 'lucide-react';
import StaffManagement from '../components/StaffManagement';
import TableManagement from '../components/TableManagement';
import Dashboard from '../components/Dashboard';
import NotificationBell from '@/shared/components/NotificationBell'; // ✅ NEW

const STORAGE_KEY = 'manager_dashboard_active_tab';

const DashboardPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || 'overview';
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'staff', label: 'Staff', icon: Users, fullLabel: 'Staff Management' },
    { id: 'tables', label: 'Tables', icon: Table2, fullLabel: 'Table Management' }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    localStorage.setItem(STORAGE_KEY, tabId);
    setMobileMenuOpen(false);
    console.log('✅ Tab saved to localStorage:', tabId);
  };

  useEffect(() => {
    const validTabs = tabs.map(t => t.id);
    if (!validTabs.includes(activeTab)) {
      handleTabChange('overview');
    }
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'staff':
        return <StaffManagement />;
      
      case 'tables':
        return <TableManagement />;
      
      case 'overview':
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  Manager Dashboard
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Manage your restaurant operations efficiently
                </p>
              </div>

              {/* ✅ RIGHT SIDE: Notification Bell + Mobile Menu */}
              <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <NotificationBell />

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="sm:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden sm:flex gap-1 -mb-px overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 lg:px-6 py-3 font-medium text-sm whitespace-nowrap rounded-t-lg transition-all
                    ${activeTab === tab.id
                      ? 'bg-gray-50 dark:bg-gray-900 text-blue-600 dark:text-blue-400 border-t-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="hidden lg:inline">{tab.fullLabel || tab.label}</span>
                  <span className="lg:hidden">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Tabs (Dropdown) */}
          {mobileMenuOpen && (
            <div className="sm:hidden pb-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 font-medium text-sm rounded-lg transition-all
                      ${activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <Icon size={20} />
                    {tab.fullLabel || tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default DashboardPage;