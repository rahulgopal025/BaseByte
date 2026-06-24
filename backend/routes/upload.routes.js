import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { createRequire } from 'module';
import { Readable } from 'stream';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

const router = express.Router();

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Not an image! Please upload only images.'));
    }
  }
});

const uploadPdf = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for PDFs
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Not a PDF! Please upload only PDF files.'));
    }
  }
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ─── UPLOAD IMAGE ─────────────────────────────────────────────
router.post('/image', verifyToken, verifyAdmin, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload an image file.');
  }

  try {
    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'basebyte_thumbnails', resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        Readable.from(buffer).pipe(stream);
      });
    };

    const result = await uploadToCloudinary(req.file.buffer);
    res.status(200).json(new ApiResponse(200, { url: result.secure_url }, 'Image uploaded successfully'));
  } catch (error) {
    throw new ApiError(500, error.message || 'Error uploading image to Cloudinary');
  }
}));

// ─── UPLOAD PDF ─────────────────────────────────────────────
router.post('/pdf', verifyToken, verifyAdmin, uploadPdf.single('pdf'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a PDF file.');
  }

  try {
    // Extract PDF metadata using pdf-parse
    let totalPages = 0;
    try {
      const pdfData = await pdfParse(req.file.buffer);
      totalPages = pdfData.numpages || 0;
    } catch (parseErr) {
      console.error("Error parsing PDF for page count:", parseErr);
    }

    // Upload to cloudinary using stream
    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'basebyte_notes', resource_type: 'image', format: 'pdf' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        Readable.from(buffer).pipe(stream);
      });
    };

    const result = await uploadToCloudinary(req.file.buffer);
    res.status(200).json(new ApiResponse(200, { url: result.secure_url, totalPages }, 'PDF uploaded successfully'));
  } catch (error) {
    throw new ApiError(500, error.message || 'Error uploading PDF to Cloudinary');
  }
}));

export default router; 