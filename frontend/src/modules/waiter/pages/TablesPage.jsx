// File: frontend/src/modules/waiter/pages/TablesPage.jsx
// ================================================================
// 🪑 WAITER TABLES PAGE - Interactive table management
// ✅ Real-time status, customer info, visual floor plan
// 🔧 FIXED: Proper user/waiterId handling
// ================================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Users, MapPin, Clock, DollarSign, RefreshCw, 
  Grid, List, Bell, CheckCircle, XCircle, AlertCircle,
  Coffee, Settings, Volume2, VolumeX, TrendingUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import gsap from 'gsap';

// Hooks
import { useAuth } from '@/shared/hooks/useAuth';
import { useTables } from '../hooks/useTables';

// Components
import TableLayout from '../components/TableLayout';
import AssignedTables from '../components/AssignedTables';
import CustomerRequests from '../components/CustomerRequests';

// Services
import notificationService from '../services/notificationService';

const TablesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get user from both Redux and useAuth hook
  const reduxUser = useSelector((state) => state.auth.user);
  const { user: authUser } = useAuth();
  const user = reduxUser || authUser;
  
  // Early return if no user (prevents "No waiter ID" warning)
  if (!user) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading user...</p>
        </div>
      </div>
    );
  }
  
  const waiterId = user._id || user.id;
  const { tables, loading, error, stats, fetchTables, updateTableStatus, getTableSession } = useTables(waiterId);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'layout'
  const [filter, setFilter] = useState('all'); // 'all' | 'occupied' | 'available' | 'reserved'
  const [refreshing, setRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(notificationService.isSoundEnabled());
  const [selectedTable, setSelectedTable] = useState(null);

  const headerRef = useRef(null);
  const statsRef = useRef(null);

  /**
   * Handle table click
   */
  const handleTableClick = async (table) => {
    setSelectedTable(table);
    
    // If table is occupied, get session details
    if (table.status === 'occupied') {
      const session = await getTableSession(table._id || table.id);
      if (session) {
        console.log('📊 Table session:', session);
      }
    }
  };

  /**
   * Handle status change
   */
  const handleStatusChange = async (tableId, newStatus) => {
    const result = await updateTableStatus(tableId, newStatus);
    if (result.success) {
      setSelectedTable(null);
    }
  };

  /**
   * Manual refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTables();
    
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Tables refreshed!', {
        position: 'top-center',
        autoClose: 2000,
      });
    }, 800);
  };

  /**
   * Toggle sound
   */
  const handleToggleSound = () => {
    const enabled = notificationService.toggleSound();
    setSoundEnabled(enabled);
    toast.success(`Sound ${enabled ? 'enabled' : 'disabled'}`);
  };

  /**
   * Filter tables
   */
  const filteredTables = tables.filter(table => {
    if (filter === 'all') return true;
    return table.status === filter;
  });

  /**
   * Get status color
   */
  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-success/10 text-success border-success/20',
      occupied: 'bg-warning/10 text-warning border-warning/20',
      reserved: 'bg-info/10 text-info border-info/20',
      cleaning: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      maintenance: 'bg-error/10 text-error border-error/20',
    };
    return colors[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status) => {
    const icons = {
      available: CheckCircle,
      occupied: Users,
      reserved: Clock,
      cleaning: Coffee,
      maintenance: AlertCircle,
    };
    return icons[status] || AlertCircle;
  };

  /**
   * Initial animations
   */
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
        });
      }

      if (statsRef.current) {
        gsap.from(statsRef.current.children, {
          scale: 0.8,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.2,
          ease: 'back.out(1.5)',
        });
      }
    });

    return () => ctx.revert();
  }, []);

  // Loading state
  if (loading && tables.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading tables...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && tables.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">No Tables Assigned</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-gradient-to-r from-brand to-secondary text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <header 
        ref={headerRef}
        className="sticky top-0 z-40 bg-bg-elevated/95 backdrop-blur-xl border-b border-border shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">
                My Tables
              </h1>
              <p className="text-sm text-text-tertiary">
                Manage your assigned tables
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Sound Toggle */}
              <button
                onClick={handleToggleSound}
                className={`p-2.5 rounded-xl transition-all ${
                  soundEnabled
                    ? 'bg-brand/10 text-brand'
                    : 'bg-bg-secondary text-text-tertiary'
                }`}
                aria-label="Toggle sound"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2.5 bg-bg-secondary hover:bg-brand/10 rounded-xl transition-all disabled:opacity-50"
                aria-label="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-brand ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-bg-secondary rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-brand text-white'
                      : 'text-text-tertiary hover:text-text-primary'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('layout')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'layout'
                      ? 'bg-brand text-white'
                      : 'text-text-tertiary hover:text-text-primary'
                  }`}
                  aria-label="Layout view"
                >
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-brand to-secondary text-white shadow-lg'
                  : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('occupied')}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                filter === 'occupied'
                  ? 'bg-gradient-to-r from-brand to-secondary text-white shadow-lg'
                  : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
              }`}
            >
              Occupied ({stats.occupied})
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                filter === 'available'
                  ? 'bg-gradient-to-r from-brand to-secondary text-white shadow-lg'
                  : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
              }`}
            >
              Available ({stats.available})
            </button>
            <button
              onClick={() => setFilter('reserved')}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                filter === 'reserved'
                  ? 'bg-gradient-to-r from-brand to-secondary text-white shadow-lg'
                  : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
              }`}
            >
              Reserved ({stats.reserved})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Statistics Cards */}
        <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-4 bg-bg-elevated rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-brand" />
              <span className="text-xs font-medium text-text-tertiary">Total Tables</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
          </div>

          <div className="p-4 bg-bg-elevated rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="w-4 h-4 text-warning" />
              <span className="text-xs font-medium text-text-tertiary">Occupied</span>
            </div>
            <p className="text-2xl font-bold text-warning">{stats.occupied}</p>
          </div>

          <div className="p-4 bg-bg-elevated rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-xs font-medium text-text-tertiary">Available</span>
            </div>
            <p className="text-2xl font-bold text-success">{stats.available}</p>
          </div>

          <div className="p-4 bg-bg-elevated rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-info" />
              <span className="text-xs font-medium text-text-tertiary">Reserved</span>
            </div>
            <p className="text-2xl font-bold text-info">{stats.reserved}</p>
          </div>
        </div>

        {/* View Toggle */}
        {viewMode === 'layout' ? (
          <TableLayout 
            tables={filteredTables} 
            onTableClick={handleTableClick}
            selectedTable={selectedTable}
          />
        ) : (
          <AssignedTables 
            tables={filteredTables}
            onTableClick={handleTableClick}
            onStatusChange={handleStatusChange}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        )}

        {/* Customer Requests Section */}
        <CustomerRequests waiterId={waiterId} />
      </main>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default TablesPage;