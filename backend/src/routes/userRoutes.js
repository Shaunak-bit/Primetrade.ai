const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/authorize');

/**
 * Route: GET /api/v1/users
 * Access: Private (Admin Only)
 * Description: Retrieves list of users for dropdown assignment
 */
router.get('/', protect, isAdmin, getAllUsers);

module.exports = router;
