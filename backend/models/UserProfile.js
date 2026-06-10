import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  // link profile to user account
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },

  // basic info
  firstName: { type: String, trim: true },
  midName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  college: { type: String, trim: true },
  address: { type: String, trim: true },
  mobile: { type: String, trim: true },
  degree: { type: String, trim: true },

  // social links
  github: { type: String, trim: true },
  linkedin: { type: String, trim: true },
  website: { type: String, trim: true },

  // profile picture url
  avatar: { type: String, default: '' },

}, { timestamps: true });

export default mongoose.model('UserProfile', userProfileSchema);