const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['investor', 'entrepreneur'],
        required: true
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    // Extended Profile Information
    profile: {
        bio: {
            type: String,
            default: ''
        },
        history: {
            type: String, // Startup history for entrepreneurs, investment history for investors
            default: ''
        },
        preferences: {
            type: String,
            default: ''
        }
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt dates

module.exports = mongoose.model('User', userSchema);