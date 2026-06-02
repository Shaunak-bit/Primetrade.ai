/**
 * Global Centalized Error Handler Middleware
 * Standardizes API responses for runtime errors, database validation errors, and other faults.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected server error occurred.';
  let errors = null;

  // Log error stack for developer troubleshooting
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

  // Sequelize-specific DB Unique Validation Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Database validation constraint failed.';
    errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Sequelize validation error (general model validation failure)
  else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation failed.';
    errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Database Connection/Timeout error
  else if (err.name === 'SequelizeConnectionRefusedError' || err.name === 'SequelizeConnectionError') {
    statusCode = 503;
    message = 'Database service is currently unavailable. Please try again later.';
  }

  // Send uniform JSON response
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
