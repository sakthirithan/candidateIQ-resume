const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');

// Protect routes - Verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Token missing.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_for_ai_recruitment_platform_2026');
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. User account not found.'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Token invalid.'
    });
  }
};

// Grant access to specific roles (with 'hr' and 'recruiter' treated as equivalent)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Expand roles list to handle 'hr' / 'recruiter' equivalence
    const expandedRoles = roles.flatMap(role => {
      if (role === 'hr' || role === 'recruiter') return ['hr', 'recruiter'];
      return [role];
    });

    const userRole = req.user.role;
    if (!expandedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role '${userRole}' is not authorized to access this resource`
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
