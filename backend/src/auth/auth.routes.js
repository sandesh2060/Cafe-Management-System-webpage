const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authMiddleware = require('./auth.middleware');

/**
 * Public routes (no authentication required)
 */

// Register new user
router.post('/register', authController.register.bind(authController));

// Login user
router.post('/login', authController.login.bind(authController));

/**
 * Protected routes (authentication required)
 */

// Get current user
router.get('/me', authMiddleware.authenticate, authController.getMe.bind(authController));

// Logout user
router.post('/logout', authMiddleware.authenticate, authController.logout.bind(authController));

// Refresh token
router.post('/refresh-token', authController.refreshToken.bind(authController));

// Change password
router.post('/change-password', authMiddleware.authenticate, authController.changePassword.bind(authController));

module.exports = router;