require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
async function startServer() {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('Successfully connected to the Supabase PostgreSQL database.');

    // Sync models (creates tables if they do not exist)
    // Using alter: true in development mode can automatically adapt schema changes without data loss
    const syncOptions = process.env.NODE_ENV === 'development' ? { alter: true } : {};
    await sequelize.sync(syncOptions);
    console.log('Database models successfully synchronized.');

    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! Shutting down gracefully...');
      console.error(err.name, err.message, err.stack);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('UNCAUGHT EXCEPTION! Shutting down gracefully...');
      console.error(err.name, err.message, err.stack);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    console.error('Failed to initialize application:', error.message);
    process.exit(1);
  }
}

startServer();
