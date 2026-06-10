// Phase 2 — To be implemented
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getLecturesByCourse = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, [], 'Lectures coming soon.'));
});

export const addLecture = asyncHandler(async (req, res) => {
  res.status(201).json(new ApiResponse(201, null, 'Add lecture coming soon.'));
});

export const updateLecture = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, null, 'Update lecture coming soon.'));
});

export const deleteLecture = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, null, 'Delete lecture coming soon.'));
});
