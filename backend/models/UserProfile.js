import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  email: { type: String },
  firstName: { type: String, default: '' },
  midName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  bio: { type: String, default: '' },
  college: { type: String, default: '' },
  address: { type: String, default: '' },
  location: { type: String, default: '' },
  mobile: { type: String, default: '' },
  degree: { type: String, default: 'B.Tech' },
  graduationYear: { type: String, default: '' },
  skills: [{ type: String }],
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  website: { type: String, default: '' },
  twitter: { type: String, default: '' },
  avatar: { type: String, default: '' },
}, { timestamps: true });

UserProfileSchema.index({ userId: 1 });

export default mongoose.model('UserProfile', UserProfileSchema);