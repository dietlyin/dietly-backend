require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// ── Connect to MongoDB (awaited per-request for serverless cold starts) ──
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ── Global Middleware ──
app.use(helmet());

const corsOrigin = (process.env.CORS_ORIGIN || 'http://localhost:3000').trim();
app.use(cors({
  origin: corsOrigin === '*' ? true : corsOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Rate Limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth', authLimiter);

// ── Routes ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/meals', require('./routes/meals'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/faqs', require('./routes/faqs'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/gym-partnership', require('./routes/gymPartnership'));
app.use('/api/users', require('./routes/users'));

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Dietly API is running', timestamp: new Date().toISOString() });
});

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──
app.use((err, req, res, _next) => {
  console.error('Error:', err.message);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: 'Validation Error', errors: messages });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, message: `Duplicate value for ${field}` });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
});

// ── Start Server (local only, Vercel uses serverless export) ──
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Dietly API running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
}

module.exports = app;
