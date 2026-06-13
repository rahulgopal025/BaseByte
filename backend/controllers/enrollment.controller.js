import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const requestEnrollment = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  if (!courseId) throw new ApiError(400, 'courseId is required.');

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, 'Course not found.');

  const existing = await Enrollment.findOne({ userId: req.user.id, courseId });
  if (existing) throw new ApiError(400, 'Already enrolled or request pending.');

  const status = course.isFree ? 'approved' : 'pending';

  const enrollment = await Enrollment.create({
    userId: req.user.id,
    courseId,
    status
  });

  res.status(201).json(new ApiResponse(201, enrollment,
    course.isFree ? 'Enrolled successfully.' : 'Enrollment request submitted.'
  ));
});

export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ userId: req.user.id, status: 'approved' })
    .populate('courseId', 'title description thumbnail instructor price isFree')
    .sort({ enrolledAt: -1 });
  res.json(new ApiResponse(200, enrollments, 'Enrollments fetched.'));
});

export const checkEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    userId: req.user.id,
    courseId: req.params.courseId
  });
  res.json(new ApiResponse(200, {
    enrolled: !!enrollment,
    status: enrollment?.status || null
  }, 'Enrollment status fetched.'));
});

export const getPendingEnrollments = asyncHandler(async (req, res) => {
  const pending = await Enrollment.find({ status: 'pending' })
    .populate('userId', 'name email')
    .populate('courseId', 'title price')
    .sort({ enrolledAt: -1 });
  res.json(new ApiResponse(200, pending, 'Pending enrollments fetched.'));
});

export const updateEnrollmentStatus = asyncHandler(async (req, res) => {
  const { enrollmentId, status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Invalid status.');
  }
  const updated = await Enrollment.findByIdAndUpdate(enrollmentId, { status }, { new: true });
  if (!updated) throw new ApiError(404, 'Enrollment not found.');
  res.json(new ApiResponse(200, updated, `Enrollment ${status}.`));
});
