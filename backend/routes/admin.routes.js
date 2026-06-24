import express from 'express';
import Enrollment from '../models/Enrollment.js';
import Lecture from '../models/Lecture.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Problem from '../models/Problem.js';
import Quiz from '../models/Quiz.js';
import Notes from '../models/Notes.js';
import Feedback from '../models/Feedback.js';
import PracticePath from '../models/PracticePath.js';
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
    totalPracticePaths,
    recentStudents
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Course.countDocuments(),
    Problem.countDocuments(),
    Quiz.countDocuments(),
    Feedback.countDocuments(),
    Notes.countDocuments({ isApproved: true }),
    Enrollment.countDocuments({ status: 'pending' }),
    PracticePath.countDocuments(),
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
    totalPracticePaths,
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
    .populate('noteId', 'title price offerPrice isFree')
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

router.post('/courses/:id/enroll', asyncHandler(async (req, res) => {
  const { identifiers } = req.body;
  if (!Array.isArray(identifiers) || identifiers.length === 0) {
    throw new ApiError(400, 'Please provide an array of emails or usernames.');
  }

  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found.');

  const users = await User.find({
    $or: [
      { email: { $in: identifiers } },
      { username: { $in: identifiers } }
    ]
  });

  const foundIdentifiers = new Set([
    ...users.map(u => u.email),
    ...users.map(u => u.username).filter(Boolean)
  ]);
  const notFound = identifiers.filter(id => !foundIdentifiers.has(id));

  let enrolledCount = 0;
  for (const user of users) {
    const existing = await Enrollment.findOne({ userId: user._id, courseId: course._id });
    if (!existing) {
      await Enrollment.create({
        userId: user._id,
        userEmail: user.email,
        courseId: course._id,
        status: 'approved'
      });
      enrolledCount++;
    } else if (existing.status !== 'approved') {
      existing.status = 'approved';
      await existing.save();
      enrolledCount++;
    }
  }

  res.status(200).json(new ApiResponse(200, {
    enrolledCount,
    notFound
  }, `Successfully enrolled ${enrolledCount} students.`));
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

// ─── BULK PROBLEM UPLOAD ─────────────────────────────────────────────
router.post('/problems/bulk', asyncHandler(async (req, res) => {
  const { problems } = req.body;
  if (!Array.isArray(problems) || problems.length === 0) {
    throw new ApiError(400, 'problems must be a non-empty array.');
  }
  const inserted = await Problem.insertMany(problems);
  res.status(201).json(new ApiResponse(201, {
    count: inserted.length
  }, `${inserted.length} practice problems uploaded successfully.`));
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
    .populate('courses', 'title')
    .sort({ createdAt: -1 })
    .lean();

  const enrollments = await Enrollment.aggregate([
    { $match: { noteId: { $exists: true }, status: 'approved' } },
    { $group: { _id: '$noteId', count: { $sum: 1 } } }
  ]);

  const enrollmentMap = enrollments.reduce((acc, curr) => {
    acc[curr._id.toString()] = curr.count;
    return acc;
  }, {});

  notes.forEach(note => {
    note.purchases = enrollmentMap[note._id.toString()] || 0;
  });

  res.json(new ApiResponse(200, notes, 'Notes fetched.'));
}));

router.post('/notes', asyncHandler(async (req, res) => {
  const { previewStartPage, previewEndPage, totalPages } = req.body;
  if (previewStartPage && previewStartPage < 1) throw new ApiError(400, "Preview start page must be greater than 0");
  if (previewStartPage && previewEndPage && previewEndPage < previewStartPage) throw new ApiError(400, "Preview end page must be greater than or equal to start page");
  if (previewEndPage && totalPages && previewEndPage > totalPages) throw new ApiError(400, "Preview end page cannot exceed total pages");

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

router.put('/notes/:id', asyncHandler(async (req, res) => {
  const { title, subject, price, offerPrice, isFree, isPremium, description, courses, thumbnailUrl, previewStartPage, previewEndPage, totalPages } = req.body;
  
  if (previewStartPage && previewStartPage < 1) throw new ApiError(400, "Preview start page must be greater than 0");
  if (previewStartPage && previewEndPage && previewEndPage < previewStartPage) throw new ApiError(400, "Preview end page must be greater than or equal to start page");
  // Total pages might not be in req.body for updates if the file didn't change, we should check existing if not provided
  const existingNote = await Notes.findById(req.params.id);
  if (!existingNote) throw new ApiError(404, 'Notes not found.');
  
  const finalTotalPages = totalPages || existingNote.totalPages;
  if (previewEndPage && finalTotalPages && previewEndPage > finalTotalPages) {
    throw new ApiError(400, "Preview end page cannot exceed total pages");
  }

  const note = await Notes.findByIdAndUpdate(
    req.params.id,
    { title, subject, price, offerPrice, isFree, isPremium, description, courses, thumbnailUrl, previewStartPage, previewEndPage, totalPages: finalTotalPages },
    { new: true }
  );
  if (!note) throw new ApiError(404, 'Notes not found.');
  res.json(new ApiResponse(200, note, 'Notes updated.'));
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