/**
 * Global Express Error-Handling Middleware
 *
 * Must be registered LAST in the middleware stack after all routes:
 *   app.use(errorHandler);
 *
 * Express identifies this as an error handler because it accepts 4 args.
 * Any route/controller that calls `next(error)` will be caught here.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ── Mongoose: Bad ObjectId (e.g. /api/tasks/not-a-valid-id) ────────
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found (invalid id: ${err.value})`;
  }

  // ── Mongoose: Duplicate key (e.g. duplicate email) ─────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // ── Mongoose: Schema validation error ──────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join('; ');
  }

  // ── JWT errors (in case they slip past the auth middleware) ─────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired. Please log in again.';
  }

  // ── Build the response ──────────────────────────────────────────────
  const response = {
    success: false,
    statusCode,
    message,
  };

  // In development, include the full stack trace for easier debugging
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
