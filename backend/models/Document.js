const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    fileUrl: {
        type: String, 
        required: true // This will store the path/link to the actual file
    },
    documentType: {
        type: String,
        enum: ['Pitch Deck', 'Financial Model', 'Legal', 'Other'],
        default: 'Other'
    },
    // The "Data Room" aspect: Only users in this array can view the document
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    }],
    
    // --- NEW: E-Signature Storage Fields ---
    signatureUrl: {
        type: String,
        default: null
    },
    status: {
        type: String,
        default: 'Pending', // Can be 'Pending' or 'Signed'
    }
    
}, 
{ timestamps: true });

module.exports = mongoose.model('Document', documentSchema);