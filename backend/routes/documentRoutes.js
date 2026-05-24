const express = require('express');
const router = express.Router();
// NEW: Added signDocument to the imports
const { uploadDocument, getDocuments, signDocument } = require('../controllers/documentController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Our multer config

// @route   POST /api/documents/upload
// @desc    Upload a single document (Protected)
// The string 'file' must match the name of the form data field sent from React
router.post('/upload', auth, upload.single('file'), uploadDocument);

// @route   GET /api/documents
// @desc    Get all documents for logged-in user (Protected)
router.get('/', auth, getDocuments);

// --- NEW: E-Signature Route ---
// @route   POST /api/documents/:id/sign
// @desc    Upload an e-signature and link it to a document
router.post('/:id/sign', auth, upload.single('signature'), signDocument);

module.exports = router;