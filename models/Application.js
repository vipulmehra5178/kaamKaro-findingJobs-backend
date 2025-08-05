const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
 phone: {
  type: String,
  required: true,
  validate: {
    validator: function (v) {
      return /^\d{10}$/.test(v);
    },
    message: props => `${props.value} is not a valid 10-digit phone number!`
  }
},
  resumeUrl: {
    type: String,
    required: true
  },
  skills: [String],
  experience: {
    type: String 
  },
  
  education: {
    degree: String,
    institution: String,
    yearOfCompletion: String
  },
  portfolioLinks: [String],
  coverLetter: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
