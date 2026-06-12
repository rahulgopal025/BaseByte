import Notes from '../models/Notes.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Notes.find({ isApproved: true }).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, notes, 'Notes fetched.'));
});

export const uploadNotes = asyncHandler(async (req, res) => {
  const { title, fileUrl, subject, price, isFree } = req.body;
  if (!title || !fileUrl) throw new ApiError(400, 'Title and fileUrl are required.');

  const note = await Notes.create({
    title, fileUrl, subject, price, isFree,
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
