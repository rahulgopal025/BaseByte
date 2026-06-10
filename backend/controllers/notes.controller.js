// Phase 2 — To be implemented
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const uploadNotes = asyncHandler(async (req, res) => {
  res.status(201).json(new ApiResponse(201, null, 'Upload notes coming soon.'));
});

export const getAllNotes = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, [], 'Notes coming soon.'));
});

export const approveNotes = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, null, 'Approve notes coming soon.'));
});
