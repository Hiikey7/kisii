const User = require('../models/User');
const Department = require('../models/Department');
const { generateToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/email');
const mongoose = require('mongoose');

// @desc Register a new user
// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword, role, department } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Validate department for officers
    if ((role === 'officer' || role === 'admin') && !department) {
      return res.status(400).json({
        success: false,
        message: 'Department is required for field officers',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please use a different email or login.',
      });
    }

    // Create user object
    const userData = {
      firstName,
      lastName,
      email,
      phone,
      password,
      role: role || 'citizen',
    };

    // Add department if user is officer or admin
    if ((role === 'officer' || role === 'admin') && department) {
      // Validate that the department exists
      if (!mongoose.Types.ObjectId.isValid(department)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid department ID',
        });
      }

      const departmentExists = await Department.findById(department);
      if (!departmentExists) {
        return res.status(400).json({
          success: false,
          message: 'Selected department does not exist',
        });
      }

      userData.department = department;
    }

    // Create user
    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id, user.role);

    // Send welcome email (don't block on this)
    sendEmail(
      email,
      'Welcome to E-County Kisii - Issue Reporting System',
      `<h2>Welcome, ${firstName}!</h2>
       <p>Your account has been created successfully as a ${role}.</p>
       <p>You can now report issues and track their status in real-time.</p>
       <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login">Log in to your account</a></p>`
    ).catch(err => console.error('Email sending failed:', err));

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department || null,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists. Please use a different ${field}.`,
      });
    }

    next(error);
  }
};

// @desc Login user
// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated',
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get current logged in user
// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
