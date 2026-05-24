const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Helper to safely extract the ID from your specific token format
const getUserId = (req) => req.user?.userId || req.user?.id || req.user?._id;

// @route   POST /api/payments/deposit
// @desc    Deposit mock money into user's wallet
exports.deposit = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount." });

        const userId = getUserId(req);
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: "Account not found. Please log out and log back in." });
        }
        
        user.walletBalance = (user.walletBalance || 0) + Number(amount);
        await user.save();

        const transaction = new Transaction({
            user: user._id,
            type: 'Deposit',
            amount: Number(amount),
            status: 'Completed',
            description: 'Mock deposit via Stripe/PayPal sandbox'
        });
        await transaction.save();

        res.status(200).json({ message: "Deposit successful!", balance: user.walletBalance, transaction });
    } catch (error) {
        console.error("Deposit Error:", error);
        res.status(500).json({ message: "Server error processing deposit." });
    }
};

// @route   POST /api/payments/withdraw
// @desc    Withdraw mock money from user's wallet
exports.withdraw = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount." });

        const userId = getUserId(req);
        const user = await User.findById(userId);
        
        if (!user) return res.status(404).json({ message: "Account not found. Please log out and log back in." });
        
        const currentBalance = user.walletBalance || 0;
        if (currentBalance < amount) {
            return res.status(400).json({ message: "Insufficient funds." });
        }

        user.walletBalance = currentBalance - Number(amount);
        await user.save();

        const transaction = new Transaction({
            user: user._id,
            type: 'Withdrawal',
            amount: Number(amount),
            status: 'Completed',
            description: 'Mock withdrawal'
        });
        await transaction.save();

        res.status(200).json({ message: "Withdrawal successful!", balance: user.walletBalance, transaction });
    } catch (error) {
        console.error("Withdrawal Error:", error);
        res.status(500).json({ message: "Server error processing withdrawal." });
    }
};

// @route   POST /api/payments/transfer
// @desc    Transfer mock money to another user
exports.transfer = async (req, res) => {
    try {
        const { amount, recipientId } = req.body;
        if (!amount || amount <= 0 || !recipientId) return res.status(400).json({ message: "Invalid request." });

        const userId = getUserId(req);
        const sender = await User.findById(userId);
        if (!sender) return res.status(404).json({ message: "Account not found. Please log out and log back in." });

        const recipient = await User.findById(recipientId);
        if (!recipient) return res.status(404).json({ message: "Recipient not found." });
        
        const senderBalance = sender.walletBalance || 0;
        if (senderBalance < amount) return res.status(400).json({ message: "Insufficient funds." });

        sender.walletBalance = senderBalance - Number(amount);
        recipient.walletBalance = (recipient.walletBalance || 0) + Number(amount);
        
        await sender.save();
        await recipient.save();

        const transaction = new Transaction({
            user: sender._id,
            type: 'Transfer',
            amount: Number(amount),
            status: 'Completed',
            recipient: recipient._id,
            description: `Transferred funds to ${recipient.name || 'user'}`
        });
        await transaction.save();

        res.status(200).json({ message: "Transfer successful!", balance: sender.walletBalance, transaction });
    } catch (error) {
        console.error("Transfer Error:", error);
        res.status(500).json({ message: "Server error processing transfer." });
    }
};

// @route   GET /api/payments/history
// @desc    Get transaction history for the logged-in user
exports.getHistory = async (req, res) => {
    try {
        const userId = getUserId(req);
        const user = await User.findById(userId).select('walletBalance');
        if (!user) return res.status(404).json({ message: "Account not found." });

        const transactions = await Transaction.find({
            $or: [{ user: userId }, { recipient: userId }]
        })
        .populate('recipient', 'name email')
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

        res.status(200).json({ transactions, balance: user.walletBalance || 0 });
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ message: "Server error fetching history." });
    }
};