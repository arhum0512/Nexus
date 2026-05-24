const express = require('express');
const router = express.Router();
const { getChatHistory } = require('../controllers/messageController');
const auth = require('../middleware/authMiddleware'); // Require login to view messages

// Protect the route with auth middleware
router.get('/:otherUserId', auth, getChatHistory);

module.exports = router;