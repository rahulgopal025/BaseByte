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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.isGlobal;
    }
  },
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
