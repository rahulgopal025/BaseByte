import Feedback from '../models/Feedback.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const submitFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.create({
    ...req.body,
    userId: req.user.id,
    userEmail: req.user.email
  });

  res.status(201).json(new ApiResponse(201, feedback, 'Feedback submitted successfully.'));
});

export const getAllFeedback = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find({})
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, feedbacks, 'Feedbacks fetched successfully.'));
});
