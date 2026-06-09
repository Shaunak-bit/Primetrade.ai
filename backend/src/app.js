const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  validate: { xForwardedForHeader: false },  // ← fixes the warning
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// API Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/users', userRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;