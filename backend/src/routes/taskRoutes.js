const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getStats,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// ────────────────────────────────────────────
//  JWT Middleware — protect all task routes
// ────────────────────────────────────────────
router.use(protect);

// ────────────────────────────────────────────
//  Validation middleware chain for task body
// ────────────────────────────────────────────
const taskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low | medium | high | urgent'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Status must be todo | in-progress | completed | cancelled'),
  body('category')
    .optional()
    .isIn(['work', 'personal', 'shopping', 'health', 'finance', 'education', 'other'])
    .withMessage('Invalid category value'),
  body('progress')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be an integer between 0 and 100'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
];

// ────────────────────────────────────────────
//  Task Routes
// ────────────────────────────────────────────

/**
 * @route   GET /api/tasks/stats
 * @desc    Get aggregated statistics for the authenticated user's tasks
 * @access  Private
 * @returns { success, stats: { total, byStatus, byPriority, byCategory, overdue, dueToday, completedThisWeek, completionRate } }
 */
router.get('/stats', getStats);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for the authenticated user (with optional filtering & sorting)
 * @access  Private
 * @query   status | priority | category | search | sort | page | limit
 * @returns { success, count, total, page, pages, tasks[] }
 */

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 * @body    { title, description?, status?, priority?, category?, dueDate?, tags?, progress? }
 * @returns { success, message, task }
 */
router
  .route('/')
  .get(getTasks)
  .post(taskValidation, createTask);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID (must belong to authenticated user)
 * @access  Private
 * @param   id — Mongoose ObjectId of the task
 * @returns { success, task }
 */

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task by ID (must belong to authenticated user)
 * @access  Private
 * @param   id — Mongoose ObjectId of the task
 * @body    { title?, description?, status?, priority?, category?, dueDate?, tags?, progress? }
 * @returns { success, message, task }
 */

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Permanently delete a task by ID (must belong to authenticated user)
 * @access  Private
 * @param   id — Mongoose ObjectId of the task
 * @returns { success, message }
 */
router
  .route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
