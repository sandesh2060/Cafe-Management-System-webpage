/**
 * Role-based authorization middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Convert to lowercase for case-insensitive comparison
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
  authorize
};