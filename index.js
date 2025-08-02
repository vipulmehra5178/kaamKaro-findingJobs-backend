const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const fileUpload = require('express-fileupload');

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload()); // 👈 Correct position before routes

const PORT = process.env.PORT || 5000;

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Routes
app.get('/', (req, res) => {
  res.send('Job Portal API running...');
});
const applicationRoutes = require('./routes/applicationRoutes');

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', applicationRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
