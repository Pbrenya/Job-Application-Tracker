const fs = require('fs');
const multer = require('multer');
const path = require('path');

const envUploadDir = process.env.UPLOAD_DIR;
const isVercel = Boolean(process.env.VERCEL);
const defaultUploadRoot = path.join(__dirname, '..', 'uploads');
const vercelUploadRoot = path.join('/tmp', 'uploads');

let uploadRoot = envUploadDir
    ? (path.isAbsolute(envUploadDir)
        ? envUploadDir
        : path.resolve(__dirname, '..', envUploadDir))
    : (isVercel ? vercelUploadRoot : defaultUploadRoot);

if (isVercel && !uploadRoot.startsWith('/tmp')) {
    uploadRoot = vercelUploadRoot;
}

try {
    fs.mkdirSync(uploadRoot, { recursive: true });
} catch (err) {
    if (isVercel && err && err.code !== 'EEXIST') {
        uploadRoot = vercelUploadRoot;
        fs.mkdirSync(uploadRoot, { recursive: true });
    } else {
        throw err;
    }
}

// Set up storage engine
const storage = multer.diskStorage({
    destination: uploadRoot,
    filename: function(req, file, cb){
        // null as the first argument means no error
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('resume'); // 'resume' is the field name in the form

// Check file type
function checkFileType(file, cb){
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null, true);
    } else {
        cb('Error: PDFs, Docs, and Images Only!');
    }
}

module.exports = upload;
