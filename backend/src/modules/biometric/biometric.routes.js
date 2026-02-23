// ================================================================
// FILE: backend/src/modules/biometric/biometric.routes.js
// 🔐 BIOMETRIC ROUTES - COMPLETE & COMPATIBLE
// ✅ Face recognition (normal + ultra-strict mode)
// ✅ Fingerprint authentication
// ✅ Both old and new endpoint naming
// ================================================================

const express = require('express');
const router = express.Router();
const faceController = require('./face.controller');
const fingerprintController = require('./fingerprint.controller');

// ============================================
// FACE RECOGNITION ROUTES
// ============================================

// Face login - authenticate using face descriptor
// Supports both endpoint names for compatibility
router.post('/face-login', faceController.faceLogin);
router.post('/face/verify', faceController.faceLogin); // New endpoint name

// Register face - save face descriptor for a customer
// Supports both endpoint names for compatibility
router.post('/face-register', faceController.registerFace);
router.post('/face/register', faceController.registerFace); // New endpoint name

// Delete face data
router.delete('/face/:customerId', faceController.deleteFace);
router.delete('/face-delete/:customerId', faceController.deleteFace); // Alternative

// Get retry status for a session
router.get('/retry-status/:sessionId', faceController.getRetryStatus);

// Reset retry counter (admin/support only)
router.post('/reset-retry/:sessionId', faceController.resetRetryCounter);

// ============================================
// FINGERPRINT ROUTES (WebAuthn)
// ============================================

// Generate challenge for login attempt
router.post('/fingerprint-challenge', fingerprintController.generateChallenge);

// Verify fingerprint for existing user
router.post('/fingerprint-verify', fingerprintController.verifyFingerprint);

// Generate options for new fingerprint registration
router.post('/fingerprint-register-options', fingerprintController.generateRegistrationOptions);

// Register new fingerprint
router.post('/fingerprint-register', fingerprintController.registerFingerprint);

// Delete fingerprint (authenticated route)
router.delete('/fingerprint/:customerId', fingerprintController.deleteFingerprint);

// ============================================
// UTILITY ROUTES
// ============================================

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: '✅ Biometric routes are working!',
    timestamp: new Date().toISOString(),
    availableRoutes: {
      face: [
        'POST /api/biometric/face-login',
        'POST /api/biometric/face/verify (alias)',
        'POST /api/biometric/face-register',
        'POST /api/biometric/face/register (alias)',
        'DELETE /api/biometric/face/:customerId',
        'GET /api/biometric/retry-status/:sessionId',
        'POST /api/biometric/reset-retry/:sessionId'
      ],
      fingerprint: [
        'POST /api/biometric/fingerprint-challenge',
        'POST /api/biometric/fingerprint-verify',
        'POST /api/biometric/fingerprint-register-options',
        'POST /api/biometric/fingerprint-register',
        'DELETE /api/biometric/fingerprint/:customerId'
      ]
    }
  });
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Biometric Authentication',
    status: 'operational',
    features: {
      faceRecognition: true,
      faceRecognitionMode: 'adaptive', // Auto-detects 1-sample vs 5-sample mode
      fingerprintAuth: true,
      retryTracking: true,
      cooldownManagement: true
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;