const Job = require('../models/Job');

const createJob = async (req, res) => {
  try {
    const { title, company, location, description, salary, experience, employmentType } = req.body;

    const job = await Job.create({
      title,
      company,
      location,
      description,
      salary,
      experience,
      employmentType,
      postedBy: req.user.userId
    });

    res.status(201).json({ message: "Job posted successfully", job });
  } catch (err) {
    res.status(500).json({ message: "Failed to post job", error: err.message });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'name email');
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs", error: err.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch job", error: err.message });
  }
};
const getMyPostedJobs = async (req, res) => {
  try {
    const employerId = req.user.userId; 
    const jobs = await Job.find({ postedBy: employerId }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error in getMyPostedJobs:", err);
    res.status(500).json({ message: "Failed to fetch posted jobs", error: err.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.userId;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.postedBy.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this job" });
    }

    await job.deleteOne();

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("Error deleting job:", err);
    res.status(500).json({ message: "Failed to delete job", error: err.message });
  }
};

module.exports = { createJob, getAllJobs ,getJobById ,getMyPostedJobs ,deleteJob };
