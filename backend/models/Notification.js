import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['SYSTEM', 'COURSE', 'ALERT'],
    default: 'SYSTEM',
  },
  isGlobal: {
    type: Boolean,
    default: true,
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  targetCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  targetNotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notes'
  }],
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  link: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);
