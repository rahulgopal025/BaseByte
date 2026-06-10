import Submission from '../models/Submission.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const saveSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.create({
    ...req.body,
    userId: req.user.id
  });

  res.status(201).json(new ApiResponse(201, submission, 'Submission saved.'));
});

export const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({
    userId: req.user.id,
    problemId: req.params.problemId
  }).sort({ createdAt: -1 });

  res.json(new ApiResponse(200, submissions, 'Submissions fetched.'));
});
