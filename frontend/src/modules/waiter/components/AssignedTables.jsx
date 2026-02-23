// File: frontend/src/modules/waiter/components/AssignedTables.jsx
// 🪑 ASSIGNED TABLES COMPONENT - Grid/List view of waiter's tables
// ✅ Real-time status, customer info, quick actions

import { useEffect, useRef } from 'react';
import { 
  Users, Clock, CheckCircle, Coffee, AlertCircle, 
  Settings, Eye, DollarSign, MapPin 
} from 'lucide-react';
import gsap from 'gsap';
import { getRelativeTime, formatCurrency } from '@/shared/utils/formatters';

const AssignedTables = ({ 
  tables = [], 
  onTableClick,
  onStatusChange,
  getStatusColor,
  getStatusIcon,
  viewMode = 'grid' 
}) => {
  const tableCardsRef = useRef([]);

  /**
   * Get table capacity icon
   */
  const getCapacityIcon = (capacity) => {
    if (capacity <= 2) return '👥';
    if (capacity <= 4) return '👨‍👩‍👦‍👦';
    if (capacity <= 6) return '👨‍👩‍👧‍👦';
    return '🎪';
  };

  /**
   * Get status display
   */
  const getStatusDisplay = (status) => {
    const displays = {
      available: { icon: CheckCircle, label: 'Available', emoji: '✅' },
      occupied: { icon: Users, label: 'Occupied', emoji: '👥' },
      reserved: { icon: Clock, label: 'Reserved', emoji: '📅' },
      cleaning: { icon: Coffee, label: 'Cleaning', emoji: '🧹' },
      maintenance: { icon: AlertCircle, label: 'Maintenance', emoji: '🔧' },
    };
    
    return displays[status] || displays.available;
  };

  /**
   * Handle status change
   */
  const handleQuickStatusChange = (e, tableId, currentStatus) => {
    e.stopPropagation();
    
    // Cycle through statuses: available → occupied → cleaning → available
    const statusCycle = {
      available: 'occupied',
      occupied: 'cleaning',
      cleaning: 'available',
      reserved: 'available',
      maintenance: 'available',
    };
    
    const newStatus = statusCycle[currentStatus] || 'available';
    
    if (onStatusChange) {
      onStatusChange(tableId, newStatus);
    }
  };

  /**
   * Animate table cards on mount
   */
  useEffect(() => {
    if (tableCardsRef.current.length > 0) {
      gsap.from(tableCardsRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: 'back.out(1.2)',
      });
    }
  }, [tables.length, viewMode]);

  // Empty state
  if (!tables || tables.length === 0) {
    return (
      <div className="text-center py-16 bg-bg-elevated rounded-2xl border border-border">
        <div className="w-20 h-20 bg-bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-10 h-10 text-text-tertiary" />
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">
          No Tables Assigned
        </h3>
        <p className="text-text-secondary">
          Please contact your manager to assign tables
        </p>
      </div>
    );
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table, index) => {
          const tableId = table._id || table.id;
          const status = table.status || 'available';
          const statusDisplay = getStatusDisplay(status);
          const Icon = statusDisplay.icon;
          const isOccupied = status === 'occupied';
          const session = table.currentSession;

          return (
            <div
              key={tableId}
              ref={el => tableCardsRef.current[index] = el}
              onClick={() => onTableClick && onTableClick(table)}
              className={`
                relative bg-bg-elevated rounded-2xl border-2 transition-all cursor-pointer
                hover:shadow-xl hover:scale-105 transform
                ${isOccupied 
                  ? 'border-warning shadow-warning/20' 
                  : status === 'available'
                    ? 'border-success/30 hover:border-success'
                    : 'border-border hover:border-brand/50'
                }
              `}
            >
              {/* Status Indicator */}
              <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${
                isOccupied ? 'bg-warning animate-pulse' : 
                status === 'available' ? 'bg-success' : 'bg-gray-400'
              }`} />

              {/* Table Number */}
              <div className="p-6 text-center border-b border-border bg-gradient-to-br from-brand/5 to-secondary/5">
                <div className="text-4xl mb-2">{getCapacityIcon(table.capacity)}</div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">
                  Table {table.number}
                </h3>
                <p className="text-sm text-text-tertiary mt-1">
                  {table.capacity} seats • {table.location || 'Main Floor'}
                </p>
              </div>

              {/* Table Info */}
              <div className="p-4 space-y-3">
                {/* Status */}
                <div 
                  className={`px-3 py-2 rounded-xl font-semibold text-sm border-2 ${getStatusColor ? getStatusColor(status) : 'bg-gray-100'} cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={(e) => handleQuickStatusChange(e, tableId, status)}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon className="w-4 h-4" />
                    {statusDisplay.emoji} {statusDisplay.label}
                  </div>
                </div>

                {/* Occupied Info */}
                {isOccupied && session && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-brand" />
                      <span className="text-text-primary font-medium">
                        {session.customerName || `${session.partySize || 0} guests`}
                      </span>
                    </div>
                    
                    {session.startedAt && (
                      <div className="flex items-center gap-2 text-xs text-text-tertiary">
                        <Clock className="w-3 h-3" />
                        {getRelativeTime(session.startedAt)}
                      </div>
                    )}

                    {session.totalSpent > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-success" />
                        <span className="font-bold text-text-primary">
                          {formatCurrency(session.totalSpent)}
                        </span>
                      </div>
                    )}

                    {session.activeOrders > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <Coffee className="w-3 h-3 text-warning" />
                        <span className="text-text-primary">
                          {session.activeOrders} active order{session.activeOrders !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTableClick && onTableClick(table);
                    }}
                    className="flex-1 px-3 py-2 bg-brand/10 hover:bg-brand/20 text-brand rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                  
                  {isOccupied && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to orders for this table
                        window.location.href = `/waiter/orders?table=${tableId}`;
                      }}
                      className="flex-1 px-3 py-2 bg-warning/10 hover:bg-warning/20 text-warning rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Coffee className="w-3 h-3" />
                      Orders
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-3">
      {tables.map((table, index) => {
        const tableId = table._id || table.id;
        const status = table.status || 'available';
        const statusDisplay = getStatusDisplay(status);
        const Icon = statusDisplay.icon;
        const isOccupied = status === 'occupied';
        const session = table.currentSession;

        return (
          <div
            key={tableId}
            ref={el => tableCardsRef.current[index] = el}
            onClick={() => onTableClick && onTableClick(table)}
            className={`
              bg-bg-elevated rounded-2xl border-2 transition-all cursor-pointer
              hover:shadow-lg
              ${isOccupied 
                ? 'border-warning/50' 
                : status === 'available'
                  ? 'border-success/30'
                  : 'border-border hover:border-brand/50'
              }
            `}
          >
            <div className="p-4 flex items-center gap-4">
              {/* Table Icon */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                isOccupied ? 'bg-warning/10' : 
                status === 'available' ? 'bg-success/10' : 'bg-bg-secondary'
              }`}>
                {getCapacityIcon(table.capacity)}
              </div>

              {/* Table Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-text-primary">
                    Table {table.number}
                  </h3>
                  
                  <span className={`px-3 py-1 rounded-lg font-semibold text-xs border ${getStatusColor ? getStatusColor(status) : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-1">
                      <Icon className="w-3 h-3" />
                      {statusDisplay.emoji} {statusDisplay.label}
                    </div>
                  </span>

                  {isOccupied && (
                    <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-text-tertiary">
                  <span>{table.capacity} seats</span>
                  <span>•</span>
                  <span>{table.location || 'Main Floor'}</span>
                  
                  {isOccupied && session?.startedAt && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getRelativeTime(session.startedAt)}
                      </span>
                    </>
                  )}
                </div>

                {/* Occupied Details */}
                {isOccupied && session && (
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    {session.customerName && (
                      <span className="flex items-center gap-1 text-text-primary font-medium">
                        <Users className="w-3 h-3 text-brand" />
                        {session.customerName}
                      </span>
                    )}
                    
                    {session.totalSpent > 0 && (
                      <span className="flex items-center gap-1 text-text-primary font-semibold">
                        <DollarSign className="w-3 h-3 text-success" />
                        {formatCurrency(session.totalSpent)}
                      </span>
                    )}

                    {session.activeOrders > 0 && (
                      <span className="flex items-center gap-1 text-warning">
                        <Coffee className="w-3 h-3" />
                        {session.activeOrders} order{session.activeOrders !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTableClick && onTableClick(table);
                  }}
                  className="px-4 py-2 bg-brand/10 hover:bg-brand/20 text-brand rounded-xl transition-colors font-medium flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>

                {isOccupied && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/waiter/orders?table=${tableId}`;
                    }}
                    className="px-4 py-2 bg-warning/10 hover:bg-warning/20 text-warning rounded-xl transition-colors font-medium flex items-center gap-2"
                  >
                    <Coffee className="w-4 h-4" />
                    Orders
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AssignedTables;