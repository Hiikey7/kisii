require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const announcementRoutes = require('./routes/announcements');
const userRoutes = require('./routes/users');
const departmentRoutes = require('./routes/departments');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

// Import models
const Department = require('./models/Department');
const User = require('./models/User');

const app = express();

// Connect to MongoDB
connectDB();

// Seed departments on startup
const seedDepartments = async () => {
  try {
    const count = await Department.countDocuments();
    if (count === 0) {
      const departments = [
        { name: 'Roads & Transport', description: 'Road maintenance and transportation issues' },
        { name: 'Water & Sanitation', description: 'Water supply and sanitation services' },
        { name: 'Waste Management', description: 'Waste collection and management' },
        { name: 'Electricity', description: 'Power supply and electrical infrastructure' },
        { name: 'Education', description: 'Schools and educational facilities' },
        { name: 'Health', description: 'Healthcare facilities and services' },
      ];
      await Department.insertMany(departments);
      console.log('✅ Departments seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding departments:', error.message);
  }
};

// Call async function without blocking
seedDepartments().catch(err => console.error('Seed error:', err));

// Note: Admin user should be created manually using setup-admin.js script
// This prevents server crashes during startup
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/admin', adminRoutes);

// Notifications route
try {
  if (notificationRoutes && typeof notificationRoutes === 'function') {
    app.use('/api/notifications', notificationRoutes);
  }
} catch (err) {
  console.error('Error loading notification routes:', err.message);
}

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'E-County API is running',
    timestamp: new Date(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Serve frontend static files from build directory
const frontendBuildPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(frontendBuildPath));

// SPA fallback - serve index.html for all unmatched routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  }
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.API_PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 E-County API Server running on http://localhost:${PORT}`);
  console.log(`📝 Node Environment: ${process.env.NODE_ENV}`);
  console.log(`🔐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}\n`);
});

// Handle unhandled promise rejections (don't crash)
process.on('unhandledRejection', (err) => {
  console.error(`⚠️  Unhandled Rejection: ${err.message}`);
  // Continue running instead of exiting
});

// Handle uncaught exceptions (don't crash)
process.on('uncaughtException', (err) => {
  console.error(`⚠️  Uncaught Exception: ${err.message}`);
  // Continue running instead of exiting
});

module.exports = app;
