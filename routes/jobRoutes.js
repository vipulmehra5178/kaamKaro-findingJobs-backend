const express = require('express');
const router = express.Router();
const { createJob, getAllJobs, getJobById } = require('../controllers/jobController');
const { protect, isEmployer } = require('../middlewares/authMiddleware');

router.post('/', protect, isEmployer, createJob);
router.get('/', getAllJobs);              // Public
router.get('/:id', getJobById);           // Public

module.exports = router;
