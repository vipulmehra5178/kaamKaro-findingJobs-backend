const express = require('express');
const router = express.Router();

const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  getApplicationCount
} = require('../controllers/applicationController');

const { protect, isCandidate, isEmployer } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

router.post('/:jobId/apply', protect, isCandidate, upload.single('resume'), applyToJob);
router.get('/my', protect, isCandidate, getMyApplications);

router.get('/job/:jobId/count', protect, isEmployer, getApplicationCount);
router.get('/job/:jobId', protect, isEmployer, getJobApplications);

module.exports = router;
