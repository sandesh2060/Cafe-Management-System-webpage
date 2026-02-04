// frontend/src/components/customer/Auth/QRScanner.jsx
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import QrScanner from 'qr-scanner';
import { AlertCircle, X } from 'lucide-react';

const QRScanner = ({ onScan, onClose, isOpen }) => {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const containerRef = useRef(null);

  useGSAP(
    () => {
      if (isOpen && containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: 'back.out',
          }
        );
      }
    },
    { dependencies: [isOpen] }
  );

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        onScan(result.data);
      },
      {
        onDecodeError: () => {
          // Handle decode error silently
        },
        preferredCamera: 'environment',
        highlightCodeOutlineColor: '#ff6b35',
      }
    );

    qrScannerRef.current = scanner;
    scanner.start();

    return () => {
      scanner.stop();
    };
  }, [isOpen, onScan]);

  const handleClose = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      ease: 'back.in',
      onComplete: onClose,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        ref={containerRef}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Scan QR Code</h2>
          <button
            onClick={handleClose}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Video Stream */}
        <div className="relative bg-black aspect-square overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover" />

          {/* Overlay Grid */}
          <div className="absolute inset-0 border-4 border-orange-500 m-8 rounded-lg opacity-75" />

          {/* Corner Markers */}
          <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-orange-500" />
          <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-orange-500" />
          <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-orange-500" />
          <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-orange-500" />
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-50 flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Point your camera at the QR code on your table
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;