import Course from '../models/Course.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ isPublished: true }).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, courses, 'Courses fetched.'));
});

export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found.');
  res.json(new ApiResponse(200, course, 'Course fetched.'));
});

export const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json(new ApiResponse(201, course, 'Course created.'));
});

export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!course) throw new ApiError(404, 'Course not found.');
  res.json(new ApiResponse(200, course, 'Course updated.'));
});

export const deleteCourse = asyncHandler(async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Course deleted.'));
});
