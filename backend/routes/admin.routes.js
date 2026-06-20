import express from 'express';
import Enrollment from '../models/Enrollment.js';
import Lecture from '../models/Lecture.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Problem from '../models/Problem.js';
import Quiz from '../models/Quiz.js';
import Notes from '../models/Notes.js';
import Feedback from '../models/Feedback.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { getUserProfileData } from '../controllers/profile.controller.js';

const router = express.Router();
router.use(verifyToken, verifyAdmin);


// ─── DASHBOARD STATS ─────────────────────────────────────────────
router.get('/stats', asyncHandler(async (req, res) => {
  const [
    totalStudents,
    totalCourses,
    totalProblems,
    totalQuizzes,
    totalFeedback,
    totalNotes,
    pendingEnrollments,
    recentStudents
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Course.countDocuments(),
    Problem.countDocuments(),
    Quiz.countDocuments(),
    Feedback.countDocuments(),
    Notes.countDocuments({ isApproved: true }),
    Enrollment.countDocuments({ status: 'pending' }),
    User.find({ role: 'student' })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  res.json(new ApiResponse(200, {
    totalStudents,
    totalCourses,
    totalProblems,
    totalQuizzes,
    totalFeedback,
    totalNotes,
    pendingEnrollments,
    recentStudents
  }, 'Stats fetched.'));
}));

// ─── STUDENT MANAGEMENT ──────────────────────────────────────────
router.get('/students', asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' })
    .select('-password')
    .sort({ createdAt: -1 });
  res.json(new ApiResponse(200, students, 'Students fetched.'));
}));

router.delete('/students/:id', asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Student deleted.'));
}));

router.get('/students/:id/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  const profileData = await getUserProfileData(user._id, user.email);
  res.json(new ApiResponse(200, profileData, 'Student profile fetched.'));
}));

// ─── ENROLLMENT MANAGEMENT ───────────────────────────────────────
router.get('/enrollments', asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find()
    .populate('userId', 'name email')
    .populate('courseId', 'title price')
    .sort({ enrolledAt: -1 });
  res.json(new ApiResponse(200, enrollments, 'Enrollments fetched.'));
}));

router.get('/enrollments/pending', asyncHandler(async (req, res) => {
  const pending = await Enrollment.find({ status: 'pending' })
    .populate('userId', 'name email')
    .populate('courseId', 'title price')
    .sort({ enrolledAt: -1 });
  res.json(new ApiResponse(200, pending, 'Pending enrollments fetched.'));
}));

router.put('/enrollments/status', asyncHandler(async (req, res) => {
  const { enrollmentId, status } = req.body;
  if (!['approved', 'rejected', 'blocked'].includes(status)) {
    throw new ApiError(400, 'Invalid status. Use approved, rejected, or blocked.');
  }
  const updated = await Enrollment.findByIdAndUpdate(
    enrollmentId,
    { status },
    { new: true }
  );
  if (!updated) throw new ApiError(404, 'Enrollment not found.');
  res.json(new ApiResponse(200, updated, `Enrollment ${status}.`));
}));

// ─── COURSE MANAGEMENT ───────────────────────────────────────────
router.get('/courses', asyncHandler(async (req, res) => {
  const courses = await Course.aggregate([
    {
      $lookup: {
        from: 'enrollments',
        localField: '_id',
        foreignField: 'courseId',
        as: 'enrollments'
      }
    },
    {
      $addFields: {
        enrolledCount: {
          $size: {
            $filter: {
              input: "$enrollments",
              as: "enrollment",
              cond: { $eq: ["$$enrollment.status", "approved"] }
            }
          }
        }
      }
    },
    {
      $project: {
        enrollments: 0 // Remove the raw array to save bandwidth
      }
    },
    { $sort: { createdAt: -1 } }
  ]);
  res.json(new ApiResponse(200, courses, 'Courses fetched.'));
}));

router.post('/courses', asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json(new ApiResponse(201, course, 'Course created.'));
}));

router.put('/courses/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!course) throw new ApiError(404, 'Course not found.');
  res.json(new ApiResponse(200, course, 'Course updated.'));
}));

router.delete('/courses/:id', asyncHandler(async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Course deleted.'));
}));

// ─── LECTURE MANAGEMENT ──────────────────────────────────────────
router.get('/lectures', asyncHandler(async (req, res) => {
  const lectures = await Lecture.find()
    .populate('courseId', 'title')
    .sort({ order: 1 });
  res.json(new ApiResponse(200, lectures, 'Lectures fetched.'));
}));

router.post('/lectures', asyncHandler(async (req, res) => {
  const lecture = await Lecture.create(req.body);
  res.status(201).json(new ApiResponse(201, lecture, 'Lecture added.'));
}));

router.put('/lectures/:id', asyncHandler(async (req, res) => {
  const lecture = await Lecture.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!lecture) throw new ApiError(404, 'Lecture not found.');
  res.json(new ApiResponse(200, lecture, 'Lecture updated.'));
}));

router.delete('/lectures/:id', asyncHandler(async (req, res) => {
  await Lecture.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Lecture deleted.'));
}));

// ─── PROBLEM MANAGEMENT ──────────────────────────────────────────
router.get('/problems', asyncHandler(async (req, res) => {
  const problems = await Problem.find().sort({ createdAt: -1 });
  res.json(new ApiResponse(200, problems, 'Problems fetched.'));
}));

router.post('/problems', asyncHandler(async (req, res) => {
  const problem = await Problem.create(req.body);
  res.status(201).json(new ApiResponse(201, problem, 'Problem created.'));
}));

router.put('/problems/:id', asyncHandler(async (req, res) => {
  const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!problem) throw new ApiError(404, 'Problem not found.');
  res.json(new ApiResponse(200, problem, 'Problem updated.'));
}));

router.delete('/problems/:id', asyncHandler(async (req, res) => {
  await Problem.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Problem deleted.'));
}));

// ─── BULK QUIZ UPLOAD ─────────────────────────────────────────────
router.post('/quiz/bulk', asyncHandler(async (req, res) => {
  const { questions } = req.body;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(400, 'questions must be a non-empty array.');
  }
  const inserted = await Quiz.insertMany(questions);
  res.status(201).json(new ApiResponse(201, {
    count: inserted.length
  }, `${inserted.length} quiz questions uploaded successfully.`));
}));

router.delete('/quiz/:id', asyncHandler(async (req, res) => {
  await Quiz.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Quiz question deleted.'));
}));

// ─── NOTES MANAGEMENT ────────────────────────────────────────────
router.get('/notes', asyncHandler(async (req, res) => {
  const notes = await Notes.find()
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });
  res.json(new ApiResponse(200, notes, 'Notes fetched.'));
}));

router.post('/notes', asyncHandler(async (req, res) => {
  const note = await Notes.create({
    ...req.body,
    uploadedBy: req.user.id,
    uploaderEmail: req.user.email,
    isApproved: true
  });
  res.status(201).json(new ApiResponse(201, note, 'Notes uploaded.'));
}));

router.put('/notes/approve/:id', asyncHandler(async (req, res) => {
  const note = await Notes.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );
  if (!note) throw new ApiError(404, 'Notes not found.');
  res.json(new ApiResponse(200, note, 'Notes approved.'));
}));

router.delete('/notes/:id', asyncHandler(async (req, res) => {
  await Notes.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Notes deleted.'));
}));

// ─── FEEDBACK MANAGEMENT ─────────────────────────────────────────
router.get('/feedback', asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find()
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });
  res.json(new ApiResponse(200, feedbacks, 'Feedback fetched.'));
}));

router.delete('/feedback/:id', asyncHandler(async (req, res) => {
  await Feedback.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Feedback deleted.'));
}));

export default router;