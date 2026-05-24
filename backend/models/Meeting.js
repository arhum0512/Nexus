const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    meetingLink: {
        type: String,
        default: '' // We will populate this when we build the Video Calling module
    }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);