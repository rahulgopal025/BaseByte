import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ─── Token Generators ─────────────────────────────────────────────

// Short-lived access token (15 min) — sent with every API request
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Long-lived refresh token (7 days) — used to get new access token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ─── Signup ───────────────────────────────────────────────────────

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate all fields are present
    if (!name || !email || !password) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'All fields are required.' 
      });
    }

    // Password length check
    if (password.length < 6) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Password must be at least 6 characters.' 
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Email already registered.' 
      });
    }

    // Create user — password auto-hashed via User model pre-save hook
    const user = await User.create({ name, email, password });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token in DB for logout/revoke support
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      status: 'success',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error. Please try again.' 
    });
  }
};

// ─── Login ────────────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Email and password are required.' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Generic message — don't reveal if email exists or not
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid email or password.' 
      });
    }

    // Compare entered password with hashed password in DB
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid email or password.' 
      });
    }

    // Generate fresh tokens on every login
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      status: 'success',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error. Please try again.' 
    });
  }
};

// ─── Logout ───────────────────────────────────────────────────────

export const logout = async (req, res) => {
  try {
    // Remove refresh token from DB — token can no longer be used
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.json({ 
      status: 'success', 
      message: 'Logged out successfully.' 
    });

  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error.' 
    });
  }
};

// ─── Refresh Token 

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Check token is provided
    if (!refreshToken) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'No refresh token provided.' 
      });
    }

    // Verify token signature
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    // Check token matches what is stored in DB — prevents reuse after logout
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Invalid refresh token.' 
      });
    }

    // Issue new access token
    const newAccessToken = generateAccessToken(user);
    res.json({ 
      status: 'success', 
      accessToken: newAccessToken 
    });

  } catch (error) {
    res.status(403).json({ 
      status: 'error', 
      message: 'Invalid or expired refresh token.' 
    });
  }
};