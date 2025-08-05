const express = require('express');
const router = express.Router();
  
const { createJob, getAllJobs ,getJobById ,getMyPostedJobs} = require('../controllers/jobController');
const { protect, isEmployer } = require('../middlewares/authMiddleware');

router.post('/', protect, isEmployer, createJob); 
router.get('/', getAllJobs); 

router.get('/my-jobs', protect, isEmployer, getMyPostedJobs); 
router.get('/:id', getJobById); 



module.exports = router;
