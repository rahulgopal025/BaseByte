import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  videoUrl: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  duration: {
    type: String,
    default: ''
  },
  isLive: {
    type: Boolean,
    default: false
  },
  liveLink: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('Lecture', lectureSchema);
