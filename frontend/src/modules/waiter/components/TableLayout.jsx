// File: frontend/src/modules/waiter/components/TableLayout.jsx
// 🗺️ TABLE LAYOUT COMPONENT - Visual floor plan view
// ✅ Interactive drag & drop (future), table positioning, status indicators

import { useEffect, useRef } from 'react';
import { Users, CheckCircle, Clock, Coffee, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import { getRelativeTime } from '@/shared/utils/formatters';

const TableLayout = ({ tables = [], onTableClick, selectedTable }) => {
  const layoutRef = useRef(null);

  /**
   * Get table shape based on capacity
   */
  const getTableShape = (capacity) => {
    if (capacity <= 2) return 'circle';
    if (capacity <= 4) return 'square';
    return 'rectangle';
  };

  /**
   * Get table size class
   */
  const getTableSizeClass = (capacity) => {
    if (capacity <= 2) return 'w-20 h-20';
    if (capacity <= 4) return 'w-24 h-24';
    if (capacity <= 6) return 'w-28 h-28';
    return 'w-32 h-32';
  };

  /**
   * Get status color
   */
  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-success/20 border-success text-success',
      occupied: 'bg-warning/20 border-warning text-warning',
      reserved: 'bg-info/20 border-info text-info',
      cleaning: 'bg-purple-500/20 border-purple-500 text-purple-600',
      maintenance: 'bg-error/20 border-error text-error',
    };
    return colors[status] || colors.available;
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
    const Icon = icons[status] || CheckCircle;
    return <Icon className="w-4 h-4" />;
  };

  /**
   * Generate grid position for table (if not provided)
   */
  const getTablePosition = (table, index) => {
    // If table has custom position, use it
    if (table.position) {
      return {
        gridColumn: `span 1`,
        gridRow: `span 1`,
        transform: `translate(${table.position.x}px, ${table.position.y}px)`,
      };
    }

    // Otherwise, auto-layout in grid
    return {};
  };

  /**
   * Animate layout on mount
   */
  useEffect(() => {
    if (layoutRef.current) {
      const tableElements = layoutRef.current.querySelectorAll('.table-item');
      
      gsap.from(tableElements, {
        scale: 0.5,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'back.out(1.5)',
      });
    }
  }, [tables.length]);

  // Empty state
  if (!tables || tables.length === 0) {
    return (
      <div className="text-center py-16 bg-bg-elevated rounded-2xl border border-border">
        <div className="w-20 h-20 bg-bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-10 h-10 text-text-tertiary" />
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">
          No Tables to Display
        </h3>
        <p className="text-text-secondary">
          No tables available in floor plan view
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-elevated rounded-2xl p-6 border border-border">
      {/* Floor Plan Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Floor Plan</h2>
          <p className="text-sm text-text-tertiary">
            Interactive table layout • Click to view details
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span className="text-xs text-text-tertiary">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span className="text-xs text-text-tertiary">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-info"></div>
            <span className="text-xs text-text-tertiary">Reserved</span>
          </div>
        </div>
      </div>

      {/* Floor Plan Grid */}
      <div 
        ref={layoutRef}
        className="relative bg-gradient-to-br from-bg-secondary/50 to-bg-tertiary/50 rounded-2xl p-8 min-h-[600px] border-2 border-dashed border-border"
      >
        {/* Grid Layout */}
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 auto-rows-min">
          {tables.map((table, index) => {
            const tableId = table._id || table.id;
            const status = table.status || 'available';
            const shape = getTableShape(table.capacity);
            const isSelected = selectedTable?._id === tableId || selectedTable?.id === tableId;
            const isOccupied = status === 'occupied';
            const session = table.currentSession;

            return (
              <div
                key={tableId}
                className="table-item flex items-center justify-center"
                style={getTablePosition(table, index)}
              >
                <div
                  onClick={() => onTableClick && onTableClick(table)}
                  className={`
                    relative cursor-pointer transition-all transform hover:scale-110
                    ${getTableSizeClass(table.capacity)}
                    ${shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rounded-2xl' : 'rounded-3xl aspect-[1.5/1]'}
                    ${getStatusColor(status)}
                    border-4 shadow-lg
                    ${isSelected ? 'ring-4 ring-brand scale-110' : ''}
                    ${isOccupied ? 'animate-pulse-slow' : ''}
                  `}
                >
                  {/* Status Indicator */}
                  <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                    isOccupied ? 'bg-warning' : 
                    status === 'available' ? 'bg-success' : 
                    status === 'reserved' ? 'bg-info' : 'bg-gray-400'
                  } ${isOccupied ? 'animate-pulse' : ''}`} />

                  {/* Table Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    {/* Table Number */}
                    <div className="text-xl font-bold mb-1">
                      {table.number}
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center gap-1 text-xs opacity-80">
                      <Users className="w-3 h-3" />
                      <span>{table.capacity}</span>
                    </div>

                    {/* Occupied Info */}
                    {isOccupied && session && (
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <div className="bg-warning text-white text-xs px-2 py-1 rounded-lg font-medium shadow-lg">
                          {session.partySize || 0} guests
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-bg-elevated border border-border rounded-xl shadow-2xl p-3 whitespace-nowrap">
                      <div className="font-bold text-text-primary mb-1">
                        Table {table.number}
                      </div>
                      <div className="text-xs text-text-tertiary space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span className="capitalize">{status}</span>
                        </div>
                        <div>
                          {table.capacity} seats • {table.location || 'Main Floor'}
                        </div>
                        {isOccupied && session?.startedAt && (
                          <div className="flex items-center gap-1 text-warning">
                            <Clock className="w-3 h-3" />
                            {getRelativeTime(session.startedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table Label */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
                  <div className="text-xs font-medium text-text-primary whitespace-nowrap">
                    {table.location || 'Main'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floor Sections (Optional) */}
        {tables.some(t => t.location) && (
          <div className="absolute top-4 left-4 space-y-2">
            {[...new Set(tables.map(t => t.location))].filter(Boolean).map((location, i) => {
              const locationTables = tables.filter(t => t.location === location);
              const occupied = locationTables.filter(t => t.status === 'occupied').length;
              
              return (
                <div 
                  key={i}
                  className="bg-bg-elevated/90 backdrop-blur-sm border border-border rounded-xl px-4 py-2 shadow-lg"
                >
                  <div className="text-sm font-bold text-text-primary mb-1">
                    {location}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    {locationTables.length} tables • {occupied} occupied
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Table Details */}
      {selectedTable && (
        <div className="mt-6 p-4 bg-brand/5 border-2 border-brand/30 rounded-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-2">
                Table {selectedTable.number}
              </h3>
              <div className="space-y-1 text-sm text-text-tertiary">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Capacity: {selectedTable.capacity} seats</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedTable.status)}
                  <span className="capitalize">Status: {selectedTable.status}</span>
                </div>
                {selectedTable.location && (
                  <div>Location: {selectedTable.location}</div>
                )}
                {selectedTable.currentSession && (
                  <div className="flex items-center gap-2 text-warning">
                    <Clock className="w-4 h-4" />
                    <span>
                      Active for {getRelativeTime(selectedTable.currentSession.startedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => window.location.href = `/waiter/orders?table=${selectedTable._id || selectedTable.id}`}
              className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl font-medium transition-colors"
            >
              View Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableLayout;