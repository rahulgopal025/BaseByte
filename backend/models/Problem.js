const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Easy"
  },
  language: {
    type: String,
    required: true, 
  },
  tags: [String], 
  sampleInput: {
    type: String,
    default: ""
  },
  sampleOutput: {
    type: String,
    required: true
  },
  
  testCases: [
    {
      input: { type: String, default: "" },
      output: { type: String, required: true }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Problem", problemSchema);