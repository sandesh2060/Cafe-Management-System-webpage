// File: QRCodeDisplay.jsx
// ✅ FIXED: Properly displays base64 QR code images

import React from 'react';
import { X, Download, Printer, AlertCircle } from 'lucide-react';

const QRCodeDisplay = ({ table, qrCodeImage, onClose }) => {
  if (!table) return null;

  // ✅ Extract QR code - handle different possible locations
  const qrCodeData = qrCodeImage || table.qrCode || table.qrCodeImage || table.data?.qrCode;

  // ✅ Check if QR code exists
  const hasQRCode = qrCodeData && qrCodeData.length > 0;

  const handleDownload = () => {
    if (!hasQRCode) return;

    // Create download link
    const link = document.createElement('a');
    link.href = qrCodeData;
    link.download = `table-${table.number}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!hasQRCode) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Table ${table.number} QR Code</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
            }
            h1 {
              margin-bottom: 20px;
            }
            img {
              max-width: 400px;
              border: 2px solid #000;
              padding: 10px;
            }
            .info {
              margin-top: 20px;
              text-align: center;
            }
            @media print {
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <h1>Table ${table.number} QR Code</h1>
          <img src="${qrCodeData}" alt="Table ${table.number} QR Code" />
          <div class="info">
            <p><strong>Table Number:</strong> ${table.number}</p>
            <p><strong>Capacity:</strong> ${table.capacity} people</p>
            <p><strong>Status:</strong> ${table.status}</p>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => window.print(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            Table {table.number} QR Code
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* QR Code Image */}
        <div className="p-6">
          <div className="bg-gray-700 rounded-lg p-8 mb-6 flex items-center justify-center">
            {hasQRCode ? (
              <img
                src={qrCodeData}
                alt={`Table ${table.number} QR Code`}
                className="max-w-full h-auto"
                style={{ maxHeight: '400px' }}
                onError={(e) => {
                  console.error('❌ QR Code image failed to load');
                  console.error('QR Code data:', qrCodeData?.substring(0, 100) + '...');
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23374151"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af"%3EQR Code Error%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-400">
                  QR Code not available
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Try regenerating the QR code
                </p>
              </div>
            )}
          </div>

          {/* Table Info */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-400">Table Number:</p>
                <p className="text-lg font-semibold text-white">
                  {table.number}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Capacity:</p>
                <p className="text-lg font-semibold text-white">
                  {table.capacity} people
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status:</p>
                <p className={`text-lg font-semibold ${
                  table.status === 'available' 
                    ? 'text-green-400'
                    : table.status === 'occupied'
                    ? 'text-red-400'
                    : 'text-yellow-400'
                }`}>
                  {table.status}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleDownload}
              disabled={!hasQRCode}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Download size={20} />
              Download
            </button>
            <button
              onClick={handlePrint}
              disabled={!hasQRCode}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Printer size={20} />
              Print
            </button>
          </div>

          {/* Info Message */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-400">
                📱 Customers can scan this QR code to access the menu and place orders for this table.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;