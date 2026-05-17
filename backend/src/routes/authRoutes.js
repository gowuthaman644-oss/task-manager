const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// ────────────────────────────────────────────
//  Validation middleware chains
// ────────────────────────────────────────────

/** Rules applied to POST /register */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

/** Rules applied to POST /login */
const loginValidation = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ────────────────────────────────────────────
//  Auth Routes
// ────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 * @body    { name, email, password }
 * @returns { success, message, token, user }
 */
router.post('/register', registerValidation, register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 * @body    { email, password }
 * @returns { success, message, token, user }
 */
router.post('/login', loginValidation, login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get the currently authenticated user's profile
 * @access  Private  (requires Bearer token)
 * @headers Authorization: Bearer <token>
 * @returns { success, user }
 */
router.get('/profile', protect, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update the currently authenticated user's name
 * @access  Private  (requires Bearer token)
 * @body    { name }
 * @returns { success, message, user }
 */
router.put('/profile', protect, updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change the authenticated user's password
 * @access  Private  (requires Bearer token)
 * @body    { currentPassword, newPassword }
 * @returns { success, message }
 */
router.put('/change-password', protect, changePassword);

module.exports = router;
