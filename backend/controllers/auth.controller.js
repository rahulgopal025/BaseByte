import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── Signup ───────────────────────────────────────────────────────
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(400, 'Email already registered.');
  }

  await User.create({ name, email, password });

  res.status(201).json(
    new ApiResponse(201, null, 'Account created successfully. Please login.')
  );
});

// ─── Login ────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const accessToken = generateAccessToken(user._id);
  const refreshTokenValue = generateRefreshToken(user._id);

  // Store refresh token in DB
  await RefreshToken.create({
    token: refreshTokenValue,
    userId: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res.json(
    new ApiResponse(200, {
      accessToken,
      refreshToken: refreshTokenValue,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, 'Login successful.')
  );
});

// ─── Refresh Token ────────────────────────────────────────────────
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: tokenValue } = req.body;

  if (!tokenValue) {
    throw new ApiError(401, 'No refresh token provided.');
  }

  // Check token exists in DB
  const storedToken = await RefreshToken.findOne({ token: tokenValue });
  if (!storedToken) {
    throw new ApiError(403, 'Invalid refresh token.');
  }

  // Check if expired
  if (storedToken.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ _id: storedToken._id });
    throw new ApiError(403, 'Refresh token expired. Please login again.');
  }

  // Verify JWT signature
  const jwt = await import('jsonwebtoken');
  let decoded;
  try {
    decoded = jwt.default.verify(tokenValue, process.env.JWT_REFRESH_SECRET);
  } catch {
    await RefreshToken.deleteOne({ _id: storedToken._id });
    throw new ApiError(403, 'Invalid or expired refresh token.');
  }

  const newAccessToken = generateAccessToken(decoded.id);

  res.json(
    new ApiResponse(200, { accessToken: newAccessToken }, 'Token refreshed.')
  );
});

// ─── Logout ───────────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken: tokenValue } = req.body;

  if (tokenValue) {
    await RefreshToken.deleteOne({ token: tokenValue });
  }

  res.json(
    new ApiResponse(200, null, 'Logged out successfully.')
  );
});
