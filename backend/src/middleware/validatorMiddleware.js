const { body, validationResult } = require('express-validator');

// Error formatter for Express-Validator responses
const checkValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

const validateRegister = [
  body('email')
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 6, max: 100 }).withMessage('Password must be between 6 and 100 characters long'),
  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Role must be either user or admin'),
  checkValidationErrors
];

const validateLogin = [
  body('email')
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required'),
  checkValidationErrors
];

const validateTask = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 255 }).withMessage('Title cannot exceed 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['pending', 'completed']).withMessage('Status must be either pending or completed'),
  checkValidationErrors
];

const validateTaskUpdate = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Task title cannot be empty')
    .isLength({ max: 255 }).withMessage('Title cannot exceed 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['pending', 'completed']).withMessage('Status must be either pending or completed'),
  checkValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateTask,
  validateTaskUpdate
};
