const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const authRoutes        = require('./routes/auth.routes');
const userRoutes        = require('./routes/user.routes');
const transactionRoutes = require('./routes/transaction.routes');
const dashboardRoutes   = require('./routes/dashboard.routes');
const errorHandler      = require('./middleware/errorHandler');
const AppError          = require('./utils/AppError');

const app = express();

// ─── Security & Utility Middleware ───────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth',         authRoutes);
app.use('/api/v1/users',        userRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/dashboard',    dashboardRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404));
});

// ─── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;