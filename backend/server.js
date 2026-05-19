const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');
require('dotenv').config();

const connectDB           = require('./config/db');
const authRoutes          = require('./routes/authRoutes');
const caseRoutes          = require('./routes/caseRoutes');
const lawyerRoutes        = require('./routes/lawyerRoutes');
const notificationRoutes  = require('./routes/notificationRoutes');
const entityRoutes        = require('./routes/entityRoutes');

const app = express();

connectDB();

/* ── CORS ── */
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL,
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

/* Static uploads */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ── API Routes ── */
app.use('/api/auth',          authRoutes);
app.use('/api/cases',         caseRoutes);
app.use('/api/lawyers',       lawyerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/entities',      entityRoutes);

/* Health check */
app.get('/api/health', (_req, res) =>
  res.json({ status: 'OK', message: 'Neoteric Legal API running', timestamp: new Date() })
);

/* Global error handler */
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅  Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`)
);
