// frontend/src/components/customer/Auth/TableSelection.jsx
import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Grid3X3, ArrowRight } from 'lucide-react';

const TableSelection = ({ onSelect }) => {
  const [selectedTable, setSelectedTable] = useState(null);
  const containerRef = useRef(null);
  const gridRef = useRef(null);
  const [tables] = useState(
    Array.from({ length: 12 }, (_, i) => ({ id: i + 1, capacity: 2 + (i % 4) }))
  );

  useGSAP(
    () => {
      // Animate container
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      );

      // Animate grid items
      gsap.fromTo(
        gridRef.current?.children,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: 'back.out',
        },
        0.2
      );
    },
    { revertOnUpdate: true }
  );

  const handleTableClick = (tableId) => {
    setSelectedTable(tableId);

    // Animate selection
    gsap.to(gridRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        onSelect(tableId.toString());
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div
        ref={containerRef}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid3X3 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Select Your Table</h1>
          <p className="text-orange-100">Click on your table number to continue</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Table Grid */}
          <div
            ref={gridRef}
            className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-8"
          >
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => handleTableClick(table.id)}
                className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                  selectedTable === table.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-500 bg-gray-50 hover:bg-white'
                }`}
              >
                {/* Table Number */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                    <span className="text-white font-bold text-lg">
                      {table.id}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {table.capacity} Seater
                  </p>
                </div>

                {/* Hover indicator */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                  <ArrowRight
                    size={16}
                    className="text-orange-500 animate-pulse"
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">💡 Tip:</span> Can't find your table? Ask your waiter for the table number or scan the QR code on your table.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableSelection;