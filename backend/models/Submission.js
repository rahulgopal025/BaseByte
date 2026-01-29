const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  
  code: {
    type: String,
    required: true,
  },
 
  language: {
    type: String,
    required: true,
  },
  
  status: {
    type: String,
    enum: ["Accepted", "Wrong Answer", "Pending"],
    default: "Pending",
  },
 
  testResults: [
    {
      input: String,
      expectedOutput: String,
      actualOutput: String,
      passed: Boolean,
    },
  ],
  
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Submission", submissionSchema);