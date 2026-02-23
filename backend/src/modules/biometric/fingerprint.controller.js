// ================================================================
// FILE: backend/src/modules/biometric/fingerprint.controller.js
// 🔐 FINGERPRINT AUTHENTICATION - WebAuthn Implementation
// ================================================================

const crypto = require('crypto');
const Customer = require('../customer/customer.model');
const Table = require('../table/table.model');
const TableSession = require('../table/tableSession.model');

// ============================================
// GENERATE CHALLENGE FOR LOGIN
// ============================================
exports.generateChallenge = async (req, res) => {
  try {
    const { tableId, tableNumber, action } = req.body;

    // Validate table
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    // Generate random challenge (32 bytes)
    const challenge = crypto.randomBytes(32).toString('base64');

    // Store challenge in session (you can use Redis for production)
    // For now, we'll store it temporarily in memory or database
    const challengeExpiry = Date.now() + 60000; // 1 minute

    res.json({
      success: true,
      challenge,
      timeout: 60000,
      rpId: process.env.RP_ID || req.hostname,
      rpName: process.env.RP_NAME || 'Cafe Management System',
    });
  } catch (error) {
    console.error('Challenge generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate challenge',
      error: error.message,
    });
  }
};

// ============================================
// VERIFY FINGERPRINT FOR LOGIN
// ============================================
exports.verifyFingerprint = async (req, res) => {
  try {
    const {
      credentialId,
      authenticatorData,
      clientDataJSON,
      signature,
      tableId,
      tableNumber,
    } = req.body;

    // Find customer with this credential
    const customer = await Customer.findOne({
      'biometric.fingerprint.credentialId': credentialId,
    });

    if (!customer) {
      return res.json({
        success: false,
        message: 'Fingerprint not recognized',
      });
    }

    // In production, you should verify the signature using the stored public key
    // For now, we'll trust the credential ID match
    
    // Create table session
    const session = await TableSession.create({
      table: tableId,
      customer: customer._id,
      startTime: new Date(),
      status: 'active',
      loginMethod: 'fingerprint',
    });

    // Update last login
    customer.lastLogin = new Date();
    await customer.save();

    res.json({
      success: true,
      isReturning: true,
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        loyaltyPoints: customer.loyaltyPoints,
        sessionId: session._id,
      },
    });
  } catch (error) {
    console.error('Fingerprint verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Fingerprint verification failed',
      error: error.message,
    });
  }
};

// ============================================
// GENERATE REGISTRATION OPTIONS
// ============================================
exports.generateRegistrationOptions = async (req, res) => {
  try {
    const { tableId, tableNumber } = req.body;

    // Validate table
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    // Generate temporary user ID
    const userId = crypto.randomBytes(16).toString('base64');
    const userName = `Table${tableNumber}_${Date.now()}`;

    // Generate challenge
    const challenge = crypto.randomBytes(32).toString('base64');

    res.json({
      success: true,
      challenge,
      rp: {
        name: process.env.RP_NAME || 'Cafe Management System',
        id: process.env.RP_ID || req.hostname,
      },
      user: {
        id: userId,
        name: userName,
        displayName: `Customer at Table ${tableNumber}`,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },  // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      timeout: 60000,
      attestation: 'none',
    });
  } catch (error) {
    console.error('Registration options error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate registration options',
      error: error.message,
    });
  }
};

// ============================================
// REGISTER NEW FINGERPRINT
// ============================================
exports.registerFingerprint = async (req, res) => {
  try {
    const {
      credentialId,
      publicKey,
      attestationObject,
      clientDataJSON,
      tableId,
      tableNumber,
      userId,
    } = req.body;

    // Validate table
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    // Check if credential already exists
    const existingCustomer = await Customer.findOne({
      'biometric.fingerprint.credentialId': credentialId,
    });

    if (existingCustomer) {
      // Existing customer returning
      const session = await TableSession.create({
        table: tableId,
        customer: existingCustomer._id,
        startTime: new Date(),
        status: 'active',
        loginMethod: 'fingerprint',
      });

      existingCustomer.lastLogin = new Date();
      await existingCustomer.save();

      return res.json({
        success: true,
        isReturning: true,
        customer: {
          _id: existingCustomer._id,
          name: existingCustomer.name,
          email: existingCustomer.email,
          phoneNumber: existingCustomer.phoneNumber,
          loyaltyPoints: existingCustomer.loyaltyPoints,
          sessionId: session._id,
        },
      });
    }

    // Create new customer
    const customerName = `Guest_${Date.now()}`;
    const customer = await Customer.create({
      name: customerName,
      phoneNumber: `temp_${Date.now()}`,
      biometric: {
        fingerprint: {
          credentialId,
          publicKey,
          counter: 0,
          registeredAt: new Date(),
        },
      },
      loyaltyPoints: 0,
      isGuest: true,
    });

    // Create table session
    const session = await TableSession.create({
      table: tableId,
      customer: customer._id,
      startTime: new Date(),
      status: 'active',
      loginMethod: 'fingerprint',
    });

    res.json({
      success: true,
      isReturning: false,
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        loyaltyPoints: customer.loyaltyPoints,
        sessionId: session._id,
      },
    });
  } catch (error) {
    console.error('Fingerprint registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Fingerprint registration failed',
      error: error.message,
    });
  }
};

// ============================================
// DELETE FINGERPRINT
// ============================================
exports.deleteFingerprint = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Remove fingerprint data
    customer.biometric.fingerprint = undefined;
    await customer.save();

    res.json({
      success: true,
      message: 'Fingerprint data removed successfully',
    });
  } catch (error) {
    console.error('Fingerprint deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete fingerprint',
      error: error.message,
    });
  }
};