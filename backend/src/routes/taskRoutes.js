const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { validateTask, validateTaskUpdate } = require('../middleware/validatorMiddleware');

// Require authentication for all task routes
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(validateTask, createTask);

router.route('/:id')
  .get(getTaskById)
  .put(validateTaskUpdate, updateTask)
  .delete(deleteTask);

module.exports = router;
