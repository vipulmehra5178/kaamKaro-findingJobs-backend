// app.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const applicationRoutes = require('./routes/applicationRoutes')
dotenv.config({ debug: true });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

app.get('/', (req, res) => {
  res.send('Job Portal API running...');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));

app.use('/api/applications', applicationRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});