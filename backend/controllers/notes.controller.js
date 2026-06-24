import Notes from '../models/Notes.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Notes.find({ isApproved: true }).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, notes, 'Notes fetched.'));
});

export const uploadNotes = asyncHandler(async (req, res) => {
  const { title, notesPdfUrl, subject, price, isFree } = req.body;
  if (!title || !notesPdfUrl) throw new ApiError(400, 'Title and notesPdfUrl are required.');

  const note = await Notes.create({
    title, notesPdfUrl, subject, price, isFree,
    description: req.body.description,
    thumbnailUrl: req.body.thumbnailUrl,
    offerPrice: req.body.offerPrice,
    courses: req.body.courses || [],
    uploadedBy: req.user.id,
    uploaderEmail: req.user.email,
    isApproved: false
  });

  res.status(201).json(new ApiResponse(201, note, 'Notes uploaded. Pending admin approval.'));
});

export const approveNotes = asyncHandler(async (req, res) => {
  const note = await Notes.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );
  if (!note) throw new ApiError(404, 'Notes not found.');
  res.json(new ApiResponse(200, note, 'Notes approved.'));
});

import Enrollment from '../models/Enrollment.js';

export const getNoteById = asyncHandler(async (req, res) => {
  const note = await Notes.findById(req.params.id).populate('courses', 'title');
  if (!note) throw new ApiError(404, 'Note not found.');

  let hasPurchasedCourse = false;

  if (note.isFree) {
    hasPurchasedCourse = true;
  } else {
    const isEnrolledInNote = await Enrollment.findOne({
      userId: req.user.id,
      noteId: note._id,
      status: 'approved'
    });
    
    if (isEnrolledInNote) {
      hasPurchasedCourse = true;
    } else {
      const Course = (await import('../models/Course.js')).default;
      const coursesWithFreeNote = await Course.find({ freeNotes: note._id }).select('_id');
      const courseIds = [...coursesWithFreeNote.map(c => c._id)];
      if (note.courses && note.courses.length > 0) {
        courseIds.push(...note.courses.map(c => c._id));
      }

      if (courseIds.length > 0) {
        const isEnrolledInCourse = await Enrollment.findOne({
          userId: req.user.id,
          courseId: { $in: courseIds },
          status: 'approved'
        });
        hasPurchasedCourse = !!isEnrolledInCourse;
      }
    }
  }

  res.json(new ApiResponse(200, { note, hasPurchasedCourse }, 'Note fetched successfully.'));
});
