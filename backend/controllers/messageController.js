const Message = require('../models/Message');

// @route   GET /api/messages/:otherUserId
// @desc    Get chat history between logged-in user and another user
exports.getChatHistory = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const currentUserId = req.user.userId;

        // Find all messages where these two users are the sender and receiver
        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        }).sort({ createdAt: 1 }); // Sort oldest to newest, like a real chat app

        res.status(200).json(messages);
    } catch (error) {
        console.error('Chat History Error:', error.message);
        res.status(500).json({ message: 'Server error fetching messages.' });
    }
};