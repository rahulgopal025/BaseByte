import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  // which user submitted
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // which problem was submitted
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },

  // actual code submitted by user
  code: {
    type: String,
    required: true
  },

  // language used — javascript, python, c etc.
  language: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },

  // submission result
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Pending', 'Runtime Error'],
    default: 'Pending'
  },

  // individual test case results
  testResults: [
    {
      input: { type: String, default: '' },
      expectedOutput: { type: String, default: '' },
      actualOutput: { type: String, default: '' },
      passed: { type: Boolean, default: false }
    }
  ],

  // how long code took to run in milliseconds
  executionTime: {
    type: Number,
    default: 0
  },

  // total test cases passed out of total
  score: {
    passed: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  }

}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema);