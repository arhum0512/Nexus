const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // Protect these routes!
const { deposit, withdraw, transfer, getHistory } = require('../controllers/paymentController');

// All payment routes require the user to be logged in
router.post('/deposit', auth, deposit);
router.post('/withdraw', auth, withdraw);
router.post('/transfer', auth, transfer);
router.get('/history', auth, getHistory);

module.exports = router;