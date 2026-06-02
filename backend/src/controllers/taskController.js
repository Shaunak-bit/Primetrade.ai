const { Task, User } = require('../models');

/**
 * @desc    Get all tasks
 * @route   GET /api/v1/tasks
 * @access  Private
 */
exports.getTasks = async (req, res, next) => {
  try {
    const queryOptions = {};

    // Ownership filter: standard users see only their tasks. Admins see all tasks with owner details.
    if (req.user.role !== 'admin') {
      queryOptions.where = { userId: req.user.id };
    } else {
      queryOptions.include = [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role']
        }
      ];
    }

    // Sort by most recent
    queryOptions.order = [['createdAt', 'DESC']];

    const tasks = await Task.findAll(queryOptions);

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single task by ID
 * @route   GET /api/v1/tasks/:id
 * @access  Private
 */
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: req.user.role === 'admin' ? [
        { model: User, as: 'user', attributes: ['id', 'email', 'role'] }
      ] : []
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.'
      });
    }

    // Guard: Standard users can only access their own tasks
    if (task.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this task.'
      });
    }

    return res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new task
 * @route   POST /api/v1/tasks
 * @access  Private
 */
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, userId } = req.body;
    let targetUserId = req.user.id;

    // Admin Override: Allow assigning task to another user if userId is provided
    if (req.user.role === 'admin' && userId) {
      const userExists = await User.findByPk(userId);
      if (!userExists) {
        return res.status(400).json({
          success: false,
          message: 'Cannot create task: Target user does not exist.'
        });
      }
      targetUserId = userId;
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'pending',
      userId: targetUserId
    });

    // If admin created it, fetch it again with user association included
    let responseTask = task;
    if (req.user.role === 'admin') {
      responseTask = await Task.findByPk(task.id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'email', 'role'] }]
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task: responseTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task by ID
 * @route   PUT /api/v1/tasks/:id
 * @access  Private
 */
exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, status, userId } = req.body;

    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.'
      });
    }

    // Guard: Standard users can only update their own tasks
    if (task.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to update this task.'
      });
    }

    // Admin Override: Allow re-assigning task to another user
    if (userId && req.user.role === 'admin') {
      const userExists = await User.findByPk(userId);
      if (!userExists) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update task: Target user does not exist.'
        });
      }
      task.userId = userId;
    }

    // Apply updates
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    await task.save();

    // Fetch the updated task with associations if admin
    let updatedTask = task;
    if (req.user.role === 'admin') {
      updatedTask = await Task.findByPk(task.id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'email', 'role'] }]
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete task by ID
 * @route   DELETE /api/v1/tasks/:id
 * @access  Private
 */
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.'
      });
    }

    // Guard: Standard users can only delete their own tasks
    if (task.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this task.'
      });
    }

    await task.destroy();

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
