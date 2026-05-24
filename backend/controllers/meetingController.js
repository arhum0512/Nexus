const Meeting = require('../models/Meeting');

// @route   POST /api/meetings/schedule
// @desc    Schedule a new meeting
exports.scheduleMeeting = async (req, res) => {
    try {
        const { recipientId, title, scheduledDate } = req.body;
        const requesterId = req.user.userId; // Comes from our auth middleware!

        // 1. Validate Input
        if (!recipientId || !title || !scheduledDate) {
            return res.status(400).json({ message: 'Please provide recipient, title, and date.' });
        }

        // 2. Conflict Detection (Prevent Double Booking)
        // Check if either user already has a pending or accepted meeting at this exact time
        const conflict = await Meeting.findOne({
            scheduledDate: new Date(scheduledDate),
            status: { $in: ['pending', 'accepted'] },
            $or: [
                { requester: requesterId }, { recipient: requesterId },
                { requester: recipientId }, { recipient: recipientId }
            ]
        });

        if (conflict) {
            return res.status(400).json({ message: 'Time slot conflict. One of the users is already booked.' });
        }

        // 3. Create Meeting
        const newMeeting = new Meeting({
            requester: requesterId,
            recipient: recipientId,
            title,
            scheduledDate
        });

        await newMeeting.save();
        res.status(201).json({ message: 'Meeting requested successfully', meeting: newMeeting });

    } catch (error) {
        console.error('Schedule Meeting Error:', error.message);
        res.status(500).json({ message: 'Server error while scheduling meeting.' });
    }
};

// @route   GET /api/meetings
// @desc    Get all meetings for the logged-in user
exports.getUserMeetings = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Find meetings where the user is either the requester or recipient
        // We use .populate() to get the actual names of the users instead of just their IDs
        const meetings = await Meeting.find({
            $or: [{ requester: userId }, { recipient: userId }]
        })
        .populate('requester', 'name email role')
        .populate('recipient', 'name email role')
        .sort({ scheduledDate: 1 }); // Sort by upcoming first

        res.status(200).json(meetings);

    } catch (error) {
        console.error('Get Meetings Error:', error.message);
        res.status(500).json({ message: 'Server error fetching meetings.' });
    }
};

// @route   PUT /api/meetings/:id/status
// @desc    Update meeting status (Accept/Reject)
exports.updateMeetingStatus = async (req, res) => {
    try {
        const meetingId = req.params.id;
        const { status } = req.body; // 'accepted' or 'rejected'
        const userId = req.user.userId;

        // Ensure status is valid
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status update.' });
        }

        const meeting = await Meeting.findById(meetingId);
        
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found.' });
        }

        // Only the recipient is allowed to accept or reject the meeting
        if (meeting.recipient.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this meeting.' });
        }

        meeting.status = status;
        await meeting.save();

        res.status(200).json({ message: `Meeting ${status} successfully.`, meeting });

    } catch (error) {
        console.error('Update Status Error:', error.message);
        res.status(500).json({ message: 'Server error updating meeting.' });
    }
};