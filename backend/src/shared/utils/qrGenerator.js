// File: backend/src/shared/utils/qrGenerator.js

const QRCode = require('qrcode');

/**
 * Generate QR code for table
 * @param {String} tableId - Table MongoDB ID
 * @param {String} tableNumber - Table number
 * @returns {Promise<String>} Base64 QR code image
 */
exports.generateTableQR = async (tableId, tableNumber) => {
  try {
    // ⭐ FIXED: Just encode the data, not a full URL
    // The scanner will handle navigation internally
    const qrData = JSON.stringify({
      tableId: tableId,
      tableNumber: tableNumber,
      type: 'table-login'
    });
    
    // Generate QR code as base64 image
    const qrCodeImage = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 1,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrCodeImage;
  } catch (error) {
    console.error('QR generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate generic QR code
 * @param {String} data - Data to encode
 * @returns {Promise<String>} Base64 QR code image
 */
exports.generateQRCode = async (data) => {
  try {
    const qrCodeImage = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 250
    });
    
    return qrCodeImage;
  } catch (error) {
    console.error('QR generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};