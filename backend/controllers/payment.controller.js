// Phase 2 — To be implemented
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createOrder = asyncHandler(async (req, res) => {
  res.status(201).json(new ApiResponse(201, null, 'Payment coming soon.'));
});

export const verifyPayment = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, null, 'Payment verification coming soon.'));
});
