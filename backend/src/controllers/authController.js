const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// ────────────────────────────────────────────
//  Helper — Generate signed JWT token
// ────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'taskflow_super_secret_fallback_key_2026_safe', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

// ────────────────────────────────────────────
//  @desc    Register a new user
//  @route   POST /api/auth/register
//  @access  Public
// ────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    // 1. Run express-validator checks
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    // 2. Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with that email already exists. Please log in.',
      });
    }

    // 3. Create user — password is hashed by pre-save hook in User model
    const user = await User.create({ name, email, password });

    // 4. Sign token and respond
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────
//  @desc    Authenticate user & return JWT
//  @route   POST /api/auth/login
//  @access  Public
// ────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    // 1. Run express-validator checks
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Direct bypass for Demo User to support zero-config cloud deployments
    if (email?.toLowerCase() === 'demo@taskflow.com' && password === 'demo123') {
      const demoId = '6a09847bb4bd5043e218a7d1';
      const token = generateToken(demoId);
      return res.status(200).json({
        success: true,
        message: 'Login successful!',
        token,
        user: {
          _id: demoId,
          name: 'Demo User',
          email: 'demo@taskflow.com',
        },
      });
    }

    // 2. Find user — explicitly select password field (hidden by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 3. Compare provided password against stored hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 4. Sign token and respond
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────
//  @desc    Get authenticated user's profile
//  @route   GET /api/auth/profile
//  @access  Private (JWT required)
// ────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    // req.user is set by the `protect` JWT middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────
//  @desc    Update authenticated user's profile
//  @route   PUT /api/auth/profile
//  @access  Private (JWT required)
// ────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────
//  @desc    Change authenticated user's password
//  @route   PUT /api/auth/change-password
//  @access  Private (JWT required)
// ────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both currentPassword and newPassword are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    // Fetch user with password field
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Assign new password — pre-save hook will hash it
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile, changePassword };
