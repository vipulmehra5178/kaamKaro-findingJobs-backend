const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');
const multer = require('multer');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'resumes', // Cloudinary folder
    resource_type: 'raw', // for PDFs, DOCX, etc.
    allowed_formats: ['pdf', 'doc', 'docx'],
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
