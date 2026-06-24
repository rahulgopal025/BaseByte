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
  description: {
    type: String,
    default: ''
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  notesPdfUrl: {
    type: String,
    default: ''
  },
  thumbnailUrl: {
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
  offerPrice: {
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
  },
  totalPages: {
    type: Number,
    default: 0
  },
  previewStartPage: {
    type: Number,
    default: 1
  },
  previewEndPage: {
    type: Number,
    default: 5
  },
  isPremium: {
    type: Boolean,
    default: true
  }
  
}, { timestamps: true });

export default mongoose.model('Notes', notesSchema);


