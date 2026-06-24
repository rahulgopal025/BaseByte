import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  // basic info
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
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },

  // supported languages for this problem
  language: {
    type: String,
    required: true
  },
  tags: [String],

  // Course Association
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  topic: {
    type: String,
    default: ''
  },
  
  // External Platform Links
  leetCodeUrl: { type: String, default: '' },
  gfgUrl: { type: String, default: '' },
  hackerRankUrl: { type: String, default: '' },
  codeChefUrl: { type: String, default: '' },

  // example shown to user
  sampleInput: {
    type: String,
    default: ''
  },
  sampleOutput: {
    type: String,
    required: true
  },

  // actual test cases for code evaluation
  testCases: [
    {
      input: { type: String, default: '' },
      output: { type: String, required: true }
    }
  ],

  // detailed code solution
  solution: {
    type: String,
    default: ''
  },

  // how many users solved this problem
  solvedCount: {
    type: Number,
    default: 0
  },

  // problem hints
  hints: [String],

}, { timestamps: true });

export default mongoose.model('Problem', problemSchema);


