const User = require('../models/User');

// @route   GET /api/users
// @desc    Get all users (can filter by role using query params e.g., ?role=investor)
exports.getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        
        // If a role is provided, filter by it. Otherwise, get everyone.
        const query = role ? { role } : {};
        
        // Exclude passwords from the result for security
        const users = await User.find(query).select('-password');
        
        res.status(200).json(users);
    } catch (error) {
        console.error('Fetch Users Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching users.' });
    }
};