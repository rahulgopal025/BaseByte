import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  isVerified: {
    type: Boolean,
    default: true // Existing users are kept verified. New local users will be explicitly set to false during OTP flow.
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  avatar: {
    type: String,
    default: ''
  },
  githubUsername: {
    type: String,
    default: ''
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);
