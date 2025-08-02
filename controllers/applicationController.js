const Application = require('../models/Application');

const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { resumeURL } = req.body;

    if (!resumeURL) {
      return res.status(400).json({ message: "Resume URL is required" });
    }

    const application = await Application.create({
      user: req.user.userId,
      job: jobId,
      resumeURL,
    });

    res.status(201).json({ message: "Application submitted", application });
  } catch (err) {
    res.status(500).json({ message: "Error submitting application", error: err.message });
  }
};

module.exports = { applyToJob };
