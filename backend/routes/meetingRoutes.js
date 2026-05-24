const express = require('express');
const router = express.Router();
const { scheduleMeeting, getUserMeetings, updateMeetingStatus } = require('../controllers/meetingController');
const auth = require('../middleware/authMiddleware');

// @route   POST /api/meetings/schedule
// @desc    Schedule a new meeting (Protected)
router.post('/schedule', auth, scheduleMeeting);

// @route   GET /api/meetings
// @desc    Get all meetings for logged-in user (Protected)
router.get('/', auth, getUserMeetings);

// @route   PUT /api/meetings/:id/status
// @desc    Update meeting status to accept/reject (Protected)
router.put('/:id/status', auth, updateMeetingStatus);

module.exports = router;