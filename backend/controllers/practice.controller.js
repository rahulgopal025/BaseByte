import PracticePath from '../models/PracticePath.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Get all practice paths
export const getAllPracticePaths = asyncHandler(async (req, res) => {
  const paths = await PracticePath.find().populate('problems', 'title difficulty language solvedCount tags');
  res.json(new ApiResponse(200, paths, 'Practice paths fetched successfully'));
});

// Get single practice path
export const getPracticePathById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const path = await PracticePath.findById(id).populate('problems');
  
  if (!path) {
    throw new ApiError(404, 'Practice path not found');
  }
  
  res.json(new ApiResponse(200, path, 'Practice path fetched successfully'));
});

// Admin: Create practice path
export const createPracticePath = asyncHandler(async (req, res) => {
  const path = await PracticePath.create(req.body);
  res.json(new ApiResponse(201, path, 'Practice path created successfully'));
});

// Admin: Update practice path
export const updatePracticePath = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const path = await PracticePath.findByIdAndUpdate(id, req.body, { new: true });
  
  if (!path) {
    throw new ApiError(404, 'Practice path not found');
  }
  
  res.json(new ApiResponse(200, path, 'Practice path updated successfully'));
});

// Admin: Delete practice path
export const deletePracticePath = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const path = await PracticePath.findByIdAndDelete(id);
  
  if (!path) {
    throw new ApiError(404, 'Practice path not found');
  }
  
  res.json(new ApiResponse(200, null, 'Practice path deleted successfully'));
});
