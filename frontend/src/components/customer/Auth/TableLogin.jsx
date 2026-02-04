// frontend/src/components/customer/Auth/TableLogin.jsx
import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { QrCode, Keyboard } from 'lucide-react';
import QRScanner from './QRScanner';
import Button from '@/components/common/Button/Button';

const TableLogin = ({ onTableSelect }) => {
  const [tableId, setTableId] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const buttonsRef = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      // Animate container
      tl.fromTo(
        containerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      );

      // Animate form elements
      tl.fromTo(
        formRef.current?.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
        },
        0.2
      );

      // Animate buttons
      tl.fromTo(
        buttonsRef.current?.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
        },
        0.3
      );
    },
    { revertOnUpdate: true }
  );

  const handleQRScan = (data) => {
    const table = parseInt(data);
    if (table > 0) {
      setTableId(table.toString());
      setError('');
      setScannerOpen(false);
    } else {
      setError('Invalid QR code');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tableId) {
      setError('Please enter a table number');
      return;
    }

    gsap.to(formRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        onTableSelect(tableId);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div
        ref={containerRef}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome!</h1>
          <p className="text-orange-100">Select your table to get started</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {/* Table Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Table Number
              </label>
              <input
                type="number"
                min="1"
                value={tableId}
                onChange={(e) => {
                  setTableId(e.target.value);
                  setError('');
                }}
                placeholder="Enter table number"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-gray-500 text-sm font-medium">or</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Buttons */}
          <div ref={buttonsRef} className="space-y-3">
            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition transform hover:scale-105"
            >
              <Keyboard size={20} />
              Continue with Table Number
            </Button>

            <Button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="w-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <QrCode size={20} />
              Scan QR Code
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center text-gray-600 text-sm">
          Your session will be saved to this table
        </div>
      </div>

      {/* QR Scanner */}
      <QRScanner
        isOpen={scannerOpen}
        onScan={handleQRScan}
        onClose={() => setScannerOpen(false)}
      />
    </div>
  );
};

export default TableLogin;