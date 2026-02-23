// ================================================================
// FILE: backend/src/modules/biometric/fingerprint.routes.js
// 🔐 COMPLETE BIOMETRIC ROUTES - UPDATED FOR COMPATIBILITY
// ✅ Face Recognition (with retry tracking + dual endpoint support)
// ✅ Fingerprint Authentication (WebAuthn)
// ✅ Supports both /face-login AND /face/verify endpoints
// ================================================================

const express = require('express');
const router = express.Router();
const fingerprintController = require('./fingerprint.controller');
const faceController = require('./face.controller');

// ============================================
// FACE RECOGNITION ROUTES
// ============================================

/**
 * Face login - authenticate using face descriptor
 * POST /api/biometric/face-login (original endpoint)
 * POST /api/biometric/face/verify (new endpoint - alias)
 */
router.post('/face-login', faceController.faceLogin);
router.post('/face/verify', faceController.faceLogin); // ✅ NEW - Frontend uses this

/**
 * Register face - save face descriptor for a customer
 * POST /api/biometric/face-register (original endpoint)
 * POST /api/biometric/face/register (new endpoint - alias)
 */
router.post('/face-register', faceController.registerFace);
router.post('/face/register', faceController.registerFace); // ✅ NEW - Frontend uses this

/**
 * Delete face data
 * DELETE /api/biometric/face/:customerId
 */
router.delete('/face/:customerId', faceController.deleteFace);

/**
 * Get retry status for a session
 * GET /api/biometric/retry-status/:sessionId
 */
router.get('/retry-status/:sessionId', faceController.getRetryStatus);

/**
 * Reset retry counter (admin/support only)
 * POST /api/biometric/reset-retry/:sessionId
 */
router.post('/reset-retry/:sessionId', faceController.resetRetryCounter);

// ============================================
// FINGERPRINT ROUTES (WebAuthn)
// ============================================

router.post('/fingerprint-challenge', fingerprintController.generateChallenge);
router.post('/fingerprint-verify', fingerprintController.verifyFingerprint);
router.post('/fingerprint-register-options', fingerprintController.generateRegistrationOptions);
router.post('/fingerprint-register', fingerprintController.registerFingerprint);
router.delete('/fingerprint/:customerId', fingerprintController.deleteFingerprint);

// ============================================
// UTILITY ROUTES
// ============================================

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

router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Biometric Authentication',
    status: 'operational',
    features: {
      faceRecognition: true,
      faceRecognitionMode: 'adaptive',
      fingerprintAuth: true,
      retryTracking: true,
      cooldownManagement: true,
      dualEndpoints: true
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;