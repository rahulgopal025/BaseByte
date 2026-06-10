import express from 'express';
import Enrollment from '../models/Enrollment.js';
import Lecture from '../models/Lecture.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

const router = express.Router();

// All admin routes require auth + admin
router.use(verifyToken, verifyAdmin);

// Enrollment management
router.get('/enrollments/pending', asyncHandler(async (req, res) => {
  const pending = await Enrollment.find({ status: 'pending' }).sort({ enrolledAt: -1 });
  res.json(new ApiResponse(200, pending, 'Pending enrollments fetched.'));
}));

router.put('/enrollments/status', asyncHandler(async (req, res) => {
  const { requestId, status } = req.body;
  const updated = await Enrollment.findByIdAndUpdate(requestId, { status }, { new: true });
  res.json(new ApiResponse(200, updated, 'Enrollment status updated.'));
}));

// Lecture management
router.post('/lectures/add', asyncHandler(async (req, res) => {
  const newLecture = new Lecture(req.body);
  await newLecture.save();
  res.status(201).json(new ApiResponse(201, newLecture, 'Lecture added.'));
}));

router.get('/lectures/all', asyncHandler(async (req, res) => {
  const lectures = await Lecture.find().sort({ order: 1 });
  res.json(new ApiResponse(200, lectures, 'Lectures fetched.'));
}));

// Student management
router.get('/students', asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' }).select('-password');
  res.json(new ApiResponse(200, students, 'Students fetched.'));
}));

export default router;