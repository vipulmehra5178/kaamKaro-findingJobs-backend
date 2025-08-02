const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'resumes',
    resource_type: 'auto',
    allowed_formats: ['pdf', 'doc', 'docx'],
    public_id: (req, file) => {
      const filename = file.originalname.split('.')[0];
      return `${filename}-${Date.now()}`;
    },
  },
});

const upload = multer({ storage });

module.exports = upload;
