import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  // which language this quiz belongs to
  language: { 
    type: String, 
    required: true, 
    lowercase: true,
    trim: true
  },

  // which topic inside that language
  topic: { 
    type: String, 
    required: true,
    trim: true
  },

  // the actual question
  question: { 
    type: String, 
    required: true 
  },

  // 4 options array — ["option1", "option2", "option3", "option4"]
  options: { 
    type: [String], 
    required: true,
    validate: {
      validator: (arr) => arr.length === 4,
      message: 'Quiz must have exactly 4 options.'
    }
  },

  // index of correct option — 0, 1, 2, or 3
  correctAnswer: { 
    type: Number, 
    required: true,
    min: 0,
    max: 3
  },

  // explanation shown after answer
  explanation: { 
    type: String, 
    default: '' 
  },

  // difficulty level
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  }

}, { timestamps: true });

quizSchema.index({ language: 1, topic: 1 });

export default mongoose.model('Quiz', quizSchema);