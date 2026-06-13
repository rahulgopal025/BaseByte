import Lecture from '../models/Lecture.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import ApiError from '../utils/ApiError.js';

export const getLecturesByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Check enrollment or if course is free
  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, 'Course not found');

  if (!course.isFree) {
    const enrollment = await Enrollment.findOne({ userId: req.user.id, courseId, status: 'approved' });
    if (!enrollment) {
      throw new ApiError(403, 'You must be enrolled to access these lectures');
    }
  }

  const lectures = await Lecture.find({ courseId }).sort({ order: 1 });
  res.json(new ApiResponse(200, lectures, 'Lectures fetched.'));
});

export const addLecture = asyncHandler(async (req, res) => {
  const lecture = await Lecture.create(req.body);
  res.status(201).json(new ApiResponse(201, lecture, 'Lecture added.'));
});

export const updateLecture = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!lecture) throw new ApiError(404, 'Lecture not found.');
  res.json(new ApiResponse(200, lecture, 'Lecture updated.'));
});

export const deleteLecture = asyncHandler(async (req, res) => {
  await Lecture.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Lecture deleted.'));
});
