import mongoose from 'mongoose';

const notesSchema = new mongoose.Schema({
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  uploaderEmail: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  fileUrl: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: 0
  },
  isFree: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  downloads: {
    type: Number,
    default: 0
  }
  
}, { timestamps: true });

export default mongoose.model('Notes', notesSchema);
