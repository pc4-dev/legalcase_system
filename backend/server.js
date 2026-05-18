const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const caseRoutes = require('./routes/caseRoutes');
const lawyerRoutes = require('./routes/lawyerRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Connect MongoDB
connectDB();

// ================= MIDDLEWARE =================

// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.CLIENT_URL,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static Upload Folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================= API ROUTES =================

app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/notifications', notificationRoutes);

// ================= HEALTH CHECK =================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Neoteric Legal API Running Successfully 🚀',
    timestamp: new Date(),
  });
});

// ================= ROOT ROUTE =================

app.get('/', (req, res) => {
  res.send('Neoteric Legal Backend API is Live 🚀');
});

// ================= GLOBAL ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on PORT ${PORT}`);
});