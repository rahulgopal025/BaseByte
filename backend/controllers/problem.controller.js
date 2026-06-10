import Problem from '../models/Problem.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAllProblems = asyncHandler(async (req, res) => {
  const problems = await Problem.find({}).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, problems, 'Problems fetched successfully.'));
});

export const getProblemById = asyncHandler(async (req, res) => {
  const problem = await Problem.findById(req.params.id);

  if (!problem) {
    throw new ApiError(404, 'Problem not found.');
  }

  res.json(new ApiResponse(200, problem, 'Problem fetched successfully.'));
});
