const Document = require('../models/Document');

// @route   POST /api/documents/upload
// @desc    Upload a new document to the Data Room
exports.uploadDocument = async (req, res) => {
    try {
        // 1. Check if a file was actually uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'Please attach a file.' });
        }

        const { title, description, documentType } = req.body;
        const uploaderId = req.user.userId; // From our auth middleware

        // 2. Create the document record in MongoDB
        const newDocument = new Document({
            uploader: uploaderId,
            title,
            description,
            documentType,
            // Save the web-accessible path to the file
            fileUrl: `/uploads/${req.file.filename}` 
        });

        await newDocument.save();
        res.status(201).json({ 
            message: 'Document uploaded successfully', 
            document: newDocument 
        });

    } catch (error) {
        console.error('Upload Error:', error.message);
        res.status(500).json({ message: 'Server error during file upload.' });
    }
};

// @route   GET /api/documents
// @desc    Get all documents for the logged-in user
exports.getDocuments = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Fetch documents where the user is the uploader OR the document was shared with them
        const documents = await Document.find({
            $or: [
                { uploader: userId },
                { sharedWith: userId }
            ]
        }).sort({ createdAt: -1 }); // Newest first

        res.status(200).json(documents);

    } catch (error) {
        console.error('Fetch Documents Error:', error.message);
        res.status(500).json({ message: 'Server error fetching documents.' });
    }
};
// @route   POST /api/documents/:id/sign
// @desc    Upload an e-signature and link it to a document
exports.signDocument = async (req, res) => {
    try {
        // req.file contains the uploaded signature image from multer
        if (!req.file) {
            return res.status(400).json({ message: "No signature image provided." });
        }

        // Find the document by the ID in the URL and update it
        const document = await Document.findByIdAndUpdate(
            req.params.id,
            { 
                signatureUrl: `/uploads/${req.file.filename}`, 
                status: 'Signed' 
            },
            { new: true }
        );

        if (!document) {
            return res.status(404).json({ message: "Document not found." });
        }

        res.status(200).json({ message: "Document signed successfully!", document });
    } catch (error) {
        console.error('Signature Error:', error.message);
        res.status(500).json({ message: 'Server error saving signature.' });
    }
};