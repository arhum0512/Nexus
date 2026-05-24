const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { check } = require('express-validator');

// Validation & Sanitization rules for registration
const registerValidation = [
    // Ensure name exists, remove white space, and escape HTML characters (XSS prevention)
    check('name', 'Name is required').not().isEmpty().trim().escape(),
    
    // Ensure email is valid and normalize it (e.g., lowercase)
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    
    // Ensure password is long enough and escape HTML
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }).trim().escape(),
    
    check('role', 'Role is required').not().isEmpty().trim().escape()
];

// Validation & Sanitization rules for login
const loginValidation = [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password is required').exists().trim().escape()
];

// Apply the middleware arrays to the routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

module.exports = router;