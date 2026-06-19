import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
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
  price: {
    type: Number,
    default: 0
  },
  originalPrice: {
    type: Number
  },
  discountPercentage: {
    type: String,
    default: ''
  },
  isFree: {
    type: Boolean,
    default: false
  },
  level: {
    type: String,
    default: ''
  },
  duration: {
    type: String,
    default: ''
  },
  lessonsCount: {
    type: String,
    default: ''
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  instructor: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  },
  tags: [String],
  isPublished: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
