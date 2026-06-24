import Course from '../models/Course.js';
import Problem from '../models/Problem.js';
import Notes from '../models/Notes.js';
import Notification from '../models/Notification.js';
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

  // Automatically create a global notification for the new course
  await Notification.create({
    title: `New Course Launched! 🎉`,
    message: `We just launched a new course: "${course.title}". Check it out now!`,
    type: 'COURSE',
    isGlobal: true,
    link: `/courses/${course._id}`
  });

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

export const getCourseProblems = asyncHandler(async (req, res) => {
  const problems = await Problem.find({ course: req.params.id }).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, problems, 'Course problems fetched.'));
});

export const getCourseNotes = asyncHandler(async (req, res) => {
  const notes = await Notes.find({ courses: req.params.id, isApproved: true }).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, notes, 'Course notes fetched.'));
});
