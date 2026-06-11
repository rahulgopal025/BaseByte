import UserProfile from '../models/UserProfile.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const saveProfile = asyncHandler(async (req, res) => {
  const profile = await UserProfile.findOneAndUpdate(
    { userId: req.user.id },
    { ...req.body, userId: req.user.id },
    { upsert: true, new: true, runValidators: true }
  );

  res.json(new ApiResponse(200, profile, 'Profile saved successfully.'));
});

export const getProfile = asyncHandler(async (req, res) => {
  let profile = await UserProfile.findOne({ userId: req.user.id });

  if (!profile && req.user.email) {
    profile = await UserProfile.findOne({ email: req.user.email });
    // Migrate the old profile by setting its userId
    if (profile) {
      profile.userId = req.user.id;
      await profile.save();
    }
  }

  if (!profile) {
    throw new ApiError(404, 'Profile not found. Please complete your profile.');
  }

  res.json(new ApiResponse(200, profile, 'Profile fetched successfully.'));
});
