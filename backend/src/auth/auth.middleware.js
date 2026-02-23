const jwt = require('jsonwebtoken');
const User = require('../modules/user/user.model');
const { JWT_SECRET } = require('../config/jwt');

/**
 * Authenticate user with JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - No token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('🔓 Token decoded:', { userId: decoded.id });

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log('👤 User authenticated:', { 
        id: user._id, 
        name: user.name, 
        role: user.role 
      });

      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: `Account is ${user.status}`
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Authorize user based on roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // ✅ Convert to lowercase for case-insensitive comparison
    const userRole = req.user.role?.toLowerCase();
    const allowedRoles = roles.map(r => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      console.log('❌ Authorization failed:', {
        userRole: req.user.role,
        allowedRoles: roles,
        userId: req.user._id
      });
      
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
        requiredRoles: roles
      });
    }

    console.log('✅ Authorization passed:', {
      userRole: req.user.role,
      allowedRoles: roles
    });

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};