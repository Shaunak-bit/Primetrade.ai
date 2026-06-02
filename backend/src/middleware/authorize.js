/**
 * Role-Based Access Control (RBAC) Middleware
 * Verifies if the authenticated user has the 'admin' role.
 */
const isAdmin = (req, res, next) => {
  // Ensure req.user is set (populated by protect middleware)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Session token is missing or invalid.'
    });
  }

  // Check if user is an admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  return next();
};

module.exports = {
  isAdmin
};
