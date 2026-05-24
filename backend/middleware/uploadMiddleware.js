const multer = require('multer');
const fs = require('fs');
const path = require('path');

// 1. Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 2. Configure where and how to save the files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Save to the backend/uploads folder
    },
    filename: function (req, file, cb) {
        // Create a unique filename: Timestamp + Original Name (removes spaces)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const cleanFileName = file.originalname.replace(/\s+/g, '-');
        cb(null, uniqueSuffix + '-' + cleanFileName);
    }
});

// 3. Initialize multer with the storage configuration
const upload = multer({ storage: storage });

module.exports = upload;