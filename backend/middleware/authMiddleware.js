const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Get the token from the header
    const token = req.header('Authorization')?.split(' ')[1]; // Expects format "Bearer <token>"

    // 2. Check if no token exists
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }

    // 3. Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach the decoded payload (userId and role) to the request
        next(); // Move on to the next function (the controller)
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid.' });
    }
};