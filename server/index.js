require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Validate Environment Variables
const REQUIRED_ENV_VARS = ['GEMINI_API_KEY', 'APIFY_API_TOKEN', 'MONGODB_URI', 'JWT_SECRET'];
REQUIRED_ENV_VARS.forEach(v => {
  if (!process.env[v]) {
    console.error(`❌ FATAL ERROR: Missing environment variable ${v}`);
    process.exit(1);
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const rewardRoutes = require('./routes/rewards');

const app = express();

// Connect to MongoDB
connectDB().then(async () => {
  // Seed Admin User if not exists
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@civicx.app';
  const adminExists = await User.findOne({ email: adminEmail });
  
  if (!adminExists) {
    console.log("🛠 Seeding Admin User...");
    await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
      reputationScore: 100,
      isVerifiedReporter: true
    });
    console.log("✅ Admin seeded successfully");
  } else if (adminExists.role !== 'admin') {
    console.log("⚡ Upgrading user to Admin role...");
    adminExists.role = 'admin';
    await adminExists.save();
    console.log("✅ Admin role enforced");
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://civicx.app'
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200,
  message: { message: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/rewards', rewardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CivicX API server running on port ${PORT}`);
});

module.exports = app;
