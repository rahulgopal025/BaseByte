import mongoose from 'mongoose';

const otpVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['register', 'reset'],
    required: true,
    default: 'register'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Auto-delete document after expiration
otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpVerificationSchema.index({ email: 1 });

export default mongoose.model('OtpVerification', otpVerificationSchema);
