const express = require('express');
const router = express.Router();
const { applyToJob } = require('../controllers/applicationController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const isCandidate = (req, res, next) => {
  if (req.user.role !== 'candidate') {
    return res.status(403).json({ message: "Only candidates can apply" });
  }
  next();
};

// Upload resume (form-data key: resume)
router.post('/:jobId/apply', protect, isCandidate, upload.single('resume'), applyToJob);

module.exports = router;
