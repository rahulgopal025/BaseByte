// Phase 2 — To be implemented
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const requestEnrollment = asyncHandler(async (req, res) => {
  res.status(201).json(new ApiResponse(201, null, 'Enrollment request coming soon.'));
});

export const getPendingEnrollments = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, [], 'Pending enrollments coming soon.'));
});

export const updateEnrollmentStatus = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, null, 'Update enrollment coming soon.'));
});

export const getMyEnrollments = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, [], 'My enrollments coming soon.'));
});
