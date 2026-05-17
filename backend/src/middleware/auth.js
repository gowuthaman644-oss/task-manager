const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT Authentication Middleware
 *
 * Validates the Bearer token supplied in the `Authorization` header.
 * On success, attaches the authenticated `User` document to `req.user`
 * and calls `next()`.  On failure, returns a 401 JSON response.
 *
 * Usage:
 *   router.get('/protected', protect, handler);
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // ── 1. Extract token from Authorization header ──────────────────
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please provide a valid Bearer token.',
      });
    }

    // ── 2. Verify token signature & expiry ──────────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'taskflow_super_secret_fallback_key_2026_safe');

    // Bypass database lookup for Demo User to support zero-config cloud deployments
    if (decoded.id === '6a09847bb4bd5043e218a7d1') {
      req.user = {
        _id: '6a09847bb4bd5043e218a7d1',
        name: 'Demo User',
        email: 'demo@taskflow.com',
      };
      return next();
    }

    // ── 3. Confirm the user still exists in the database ─────────────
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // ── 4. Attach user to request & continue ─────────────────────────
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }
    // Unexpected error — pass to global error handler
    next(error);
  }
};

module.exports = { protect };
