import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import OtpVerification from '../models/OtpVerification.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service.js';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── Phase 1: Send OTP ─────────────────────────────────────────────
export const sendOtp = asyncHandler(async (req, res) => {
  const { email, type } = req.body; // type: 'register' | 'reset'

  if (!email || !type) throw new ApiError(400, 'Email and type are required.');
  
  const user = await User.findOne({ email: email.toLowerCase() });

  if (type === 'register' && user) {
    throw new ApiError(400, 'Email already registered.');
  }

  if (type === 'reset') {
    if (!user) {
      throw new ApiError(404, 'No account found with this email.');
    }
  }

  // Rate limiting simple check
  const existingOtp = await OtpVerification.findOne({ email: email.toLowerCase(), type }).sort({ createdAt: -1 });
  if (existingOtp && (new Date() - existingOtp.createdAt < 60000)) {
    throw new ApiError(429, 'Please wait 60 seconds before requesting a new OTP.');
  }

  const otp = generateOTP();

  await OtpVerification.deleteMany({ email: email.toLowerCase(), type });

  await OtpVerification.create({
    email: email.toLowerCase(),
    otp,
    type,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
    attempts: 0,
    verified: false
  });

  if (type === 'register') {
    await sendVerificationEmail(email.toLowerCase(), 'Future Hacker', otp);
  } else {
    await sendPasswordResetEmail(email.toLowerCase(), user.name, otp);
  }

  res.status(200).json(new ApiResponse(200, { 
    email: email.toLowerCase(), 
    provider: user ? user.provider : null 
  }, 'OTP sent successfully.'));
});

// ─── Phase 2: Verify OTP ──────────────────────────────────────────
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp, type } = req.body;

  const otpRecord = await OtpVerification.findOne({ email: email.toLowerCase(), type });
  if (!otpRecord) throw new ApiError(400, 'Invalid or expired OTP request.');

  if (otpRecord.expiresAt < new Date()) {
    await OtpVerification.deleteOne({ _id: otpRecord._id });
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  if (otpRecord.attempts >= 5) {
    await OtpVerification.deleteOne({ _id: otpRecord._id });
    throw new ApiError(429, 'Maximum verification attempts exceeded. Please request a new OTP.');
  }

  if (otpRecord.otp !== otp) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new ApiError(400, `Invalid OTP. You have ${5 - otpRecord.attempts} attempts remaining.`);
  }

  // Success!
  otpRecord.verified = true;
  await otpRecord.save();

  res.status(200).json(new ApiResponse(200, null, 'OTP verified successfully.'));
});

// ─── Phase 3: Complete Signup ─────────────────────────────────────
export const completeSignup = asyncHandler(async (req, res) => {
  const { email, name, password } = req.body;

  const otpRecord = await OtpVerification.findOne({ email: email.toLowerCase(), type: 'register', verified: true });
  if (!otpRecord) {
    throw new ApiError(403, 'Email not verified or session expired.');
  }

  let user = await User.findOne({ email: email.toLowerCase() });
  
  if (user) {
    // Edge case handling: User linked via OAuth while local OTP was pending
    user.password = password;
    user.isVerified = true;
    user.provider = 'local';
    user.lastLogin = new Date();
    await user.save();
  } else {
    user = await User.create({
      name,
      email: email.toLowerCase(),
      password, // Pre-save hook hashes this
      isVerified: true,
      provider: 'local',
      lastLogin: new Date()
    });
  }

  await OtpVerification.deleteMany({ email: email.toLowerCase() });

  const accessToken = generateAccessToken(user._id);
  const refreshTokenValue = generateRefreshToken(user._id);

  await RefreshToken.create({
    token: refreshTokenValue,
    userId: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res.status(201).json(new ApiResponse(201, {
    accessToken, refreshToken: refreshTokenValue,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
  }, 'Account created successfully!'));
});

// ─── Phase 3: Complete Password Reset ─────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  const otpRecord = await OtpVerification.findOne({ email: email.toLowerCase(), type: 'reset', verified: true });
  if (!otpRecord) {
    throw new ApiError(403, 'Email not verified or session expired.');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(400, 'User not found.');

  user.password = newPassword; 
  await user.save();

  await OtpVerification.deleteMany({ email: email.toLowerCase() });

  const accessToken = generateAccessToken(user._id);
  const refreshTokenValue = generateRefreshToken(user._id);

  await RefreshToken.create({
    token: refreshTokenValue,
    userId: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res.status(200).json(new ApiResponse(200, {
    accessToken, refreshToken: refreshTokenValue,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
  }, 'Password reset successfully!'));
});


// ─── Local Login ──────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    $or: [
      { email: email.toLowerCase() },
      { username: email.toLowerCase() }
    ]
  });
  if (!user) {
    throw new ApiError(401, 'Invalid email/username or password.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  user.lastLogin = new Date();
  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshTokenValue = generateRefreshToken(user._id);

  await RefreshToken.create({
    token: refreshTokenValue,
    userId: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res.json(new ApiResponse(200, {
    accessToken, refreshToken: refreshTokenValue,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
  }, 'Login successful.'));
});

// ─── Google OAuth ─────────────────────────────────────────────────
export const googleAuth = asyncHandler(async (req, res) => {
  const { token } = req.body;

  let userInfo;
  try {
    const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    userInfo = googleRes.data;
  } catch (err) {
    throw new ApiError(400, 'Invalid Google token.');
  }

  const { email, name, picture } = userInfo;

  let user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    if (!user.avatar) user.avatar = picture;
    user.lastLogin = new Date();
    await user.save();
  } else {
    user = await User.create({
      name,
      email: email.toLowerCase(),
      password: generateOTP() + generateOTP(),
      isVerified: true,
      provider: 'google',
      avatar: picture,
      lastLogin: new Date()
    });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshTokenValue = generateRefreshToken(user._id);

  await RefreshToken.create({
    token: refreshTokenValue,
    userId: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res.json(new ApiResponse(200, {
    accessToken, refreshToken: refreshTokenValue,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
  }, 'Google login successful.'));
});

// ─── GitHub OAuth ─────────────────────────────────────────────────
export const githubAuth = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) throw new ApiError(400, 'GitHub code required.');

  let accessTokenRes;
  try {
    accessTokenRes = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, { headers: { accept: 'application/json' } });
  } catch (err) {
    throw new ApiError(400, 'Failed to verify GitHub code.');
  }

  const githubToken = accessTokenRes.data.access_token;
  if (!githubToken) throw new ApiError(400, 'Invalid GitHub code.');

  const [userRes, emailsRes] = await Promise.all([
    axios.get('https://api.github.com/user', { headers: { Authorization: `Bearer ${githubToken}` } }),
    axios.get('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${githubToken}` } })
  ]);

  const githubUser = userRes.data;
  const primaryEmailObj = emailsRes.data.find(e => e.primary) || emailsRes.data[0];
  const email = primaryEmailObj.email.toLowerCase();

  let user = await User.findOne({ email });

  if (user) {
    if (!user.avatar) user.avatar = githubUser.avatar_url;
    if (!user.githubUsername) user.githubUsername = githubUser.login;
    user.lastLogin = new Date();
    await user.save();
  } else {
    user = await User.create({
      name: githubUser.name || githubUser.login,
      email,
      password: generateOTP() + generateOTP(),
      isVerified: true,
      provider: 'github',
      githubUsername: githubUser.login,
      avatar: githubUser.avatar_url,
      lastLogin: new Date()
    });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshTokenValue = generateRefreshToken(user._id);

  await RefreshToken.create({
    token: refreshTokenValue,
    userId: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res.json(new ApiResponse(200, {
    accessToken, refreshToken: refreshTokenValue,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
  }, 'GitHub login successful.'));
});

// ─── Refresh Token ────────────────────────────────────────────────
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: tokenValue } = req.body;
  if (!tokenValue) throw new ApiError(401, 'No refresh token provided.');

  const storedToken = await RefreshToken.findOne({ token: tokenValue });
  if (!storedToken) throw new ApiError(403, 'Invalid refresh token.');

  if (storedToken.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ _id: storedToken._id });
    throw new ApiError(403, 'Refresh token expired.');
  }

  let decoded;
  try {
    decoded = jwt.verify(tokenValue, process.env.JWT_REFRESH_SECRET);
  } catch {
    await RefreshToken.deleteOne({ _id: storedToken._id });
    throw new ApiError(403, 'Invalid or expired refresh token.');
  }

  const newAccessToken = generateAccessToken(decoded.id);
  res.json(new ApiResponse(200, { accessToken: newAccessToken }, 'Token refreshed.'));
});

// ─── Logout ───────────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken: tokenValue } = req.body;
  if (tokenValue) {
    await RefreshToken.deleteOne({ token: tokenValue });
  }
  res.json(new ApiResponse(200, null, 'Logged out successfully.'));
});
