const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * JWT Authentication Middleware
 * Decodes the Bearer token and attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from Bearer scheme
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_me_in_production');

      // Fetch user and attach to request object (exclude password)
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user no longer exists.'
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Auth verification failed:', error.message);
      
      // Send expired or invalid token errors clearly
      const isExpired = error.name === 'TokenExpiredError';
      return res.status(401).json({
        success: false,
        message: isExpired ? 'Token expired' : 'Not authorized, invalid token.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, session token is missing.'
    });
  }
};

/**
 * Role-based Authorization Middleware
 * Restricts access to routes based on user role.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' lacks permissions for this action.`
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize
};
