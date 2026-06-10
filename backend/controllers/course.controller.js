// Phase 2 — To be implemented
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAllCourses = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, [], 'Courses coming soon.'));
});

export const getCourseById = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, null, 'Course details coming soon.'));
});

export const createCourse = asyncHandler(async (req, res) => {
  res.status(201).json(new ApiResponse(201, null, 'Create course coming soon.'));
});

export const updateCourse = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, null, 'Update course coming soon.'));
});

export const deleteCourse = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, null, 'Delete course coming soon.'));
});
