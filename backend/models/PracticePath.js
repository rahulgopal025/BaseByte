import mongoose from 'mongoose';

const practicePathSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  language: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  problems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  isPublished: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('PracticePath', practicePathSchema);
