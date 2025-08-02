const Job = require('../models/Job');

const createJob = async (req, res) => {
  try {
    const { title, company, location, description, requirements } = req.body;

    const newJob = await Job.create({
      title,
      company,
      location,
      description,
      requirements,
      createdBy: req.user.userId
    });

    res.status(201).json({ message: "Job posted successfully", job: newJob });
  } catch (err) {
    res.status(500).json({ message: "Failed to post job", error: err.message });
  }
};


// GET all jobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('createdBy', 'name email');
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs", error: err.message });
  }
};

// GET single job
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('createdBy', 'name email');

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ message: "Error getting job", error: err.message });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById
};

