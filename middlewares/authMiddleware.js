const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains userId & role
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const isEmployer = (req, res, next) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({ message: "Only employers can perform this action" });
  }
  next();
};

const isCandidate = (req, res, next) => {
  if (req.user.role !== 'candidate') {
    return res.status(403).json({ message: "Only candidates can apply for jobs" });
  }
  next();
};

module.exports = { protect, isEmployer, isCandidate };



