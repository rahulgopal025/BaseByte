import express from 'express';
import { 
  sendOtp,
  verifyOtp,
  completeSignup,
  resetPassword,
  login, 
  logout, 
  refreshToken,
  googleAuth,
  githubAuth
} from '../controllers/auth.controller.js';
import { validateLogin } from '../middleware/validate.middleware.js';

const router = express.Router();

// New Redesigned Flow
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/complete-signup', completeSignup);
router.post('/reset-password', resetPassword);

// Login
router.post('/login', validateLogin, login);

// OAuth
router.post('/google', googleAuth);
router.post('/github', githubAuth);

// Session Management
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;