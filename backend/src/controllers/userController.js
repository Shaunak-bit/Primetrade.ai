const { User } = require('../models');

/**
 * @desc    Get all users (Admin discovery endpoint for task assignees)
 * @route   GET /api/v1/users
 * @access  Private (Admin Only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    // Retrieve users, selecting only id, email, and role for security
    const users = await User.findAll({
      attributes: ['id', 'email', 'role'],
      order: [['email', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    // Pass database failures or other runtime exceptions to global errorHandler middleware
    next(error);
  }
};

module.exports = {
  getAllUsers
};
