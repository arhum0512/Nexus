const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware'); // Require login to view users

// @route   GET /api/users
router.get('/', auth, getUsers);

module.exports = router;