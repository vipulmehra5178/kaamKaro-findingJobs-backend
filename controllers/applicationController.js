const cloudinary = require("../utils/cloudinary");
const Application = require("../models/Application");
const streamifier = require("streamifier");
const Job = require("../models/Job");

const applyToJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user.userId;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const existing = await Application.findOne({
      job: jobId,
      candidate: userId,
    });
    if (existing)
      return res.status(400).json({ message: "Already applied to this job" });

    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF resumes are allowed" });
    }
    if (!req.body.phone || !/^\d{10}$/.test(req.body.phone)) {
      return res
        .status(400)
        .json({ message: "Phone number must be exactly 10 digits" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "resumes",
        resource_type: "auto",
        public_id: `resume_${Date.now()}`,
        format: "pdf",
        type: "upload",
        use_filename: true,
        unique_filename: false,
      },
      async (error, result) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "Upload failed", error: error.message });
        }

        console.log("Uploaded to:", result.secure_url);

        const application = await Application.create({
          job: jobId,
          candidate: userId,
          phone: req.body.phone,
          resumeUrl: result.secure_url,
          skills: req.body.skills?.split(",").map((s) => s.trim()) || [],
          experience: req.body.experience,
          education: {
            degree: req.body.degree,
            institution: req.body.institution,
            yearOfCompletion: req.body.yearOfCompletion,
          },
          portfolioLinks:
            req.body.portfolioLinks?.split(",").map((link) => link.trim()) ||
            [],
          coverLetter: req.body.coverLetter,
        });

        return res
          .status(201)
          .json({ message: "Applied successfully", application });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    console.error("Error applying to job:", err);
    res.status(500).json({ message: "Application failed", error: err.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const applications = await Application.find({ candidate: userId })
      .populate("job", "title company location employmentType")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch your applications",
      error: err.message,
    });
  }
};

const getJobApplications = async (req, res) => {
  try {
    const employerId = req.user.userId;
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.postedBy.toString() !== employerId) {
      return res.status(403).json({
        message: "You are not authorized to view applications for this job",
      });
    }

    const applications = await Application.find({ job: jobId })
      .populate("candidate", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch applications",
      error: err.message,
    });
  }
};
const getApplicationCount = async (req, res) => {
  try {
    const employerId = req.user.userId;
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.postedBy.toString() !== employerId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const count = await Application.countDocuments({ job: jobId });

    res.status(200).json({ jobId, applicationCount: count });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch application count",
      error: err.message,
    });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplications,
  getApplicationCount,
};
