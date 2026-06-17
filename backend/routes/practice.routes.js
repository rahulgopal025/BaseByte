import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';
import {
  getAllPracticePaths,
  getPracticePathById,
  createPracticePath,
  updatePracticePath,
  deletePracticePath
} from '../controllers/practice.controller.js';

const router = express.Router();

// Public / User routes
router.get('/', getAllPracticePaths);
router.get('/:id', getPracticePathById);

// Admin routes
router.post('/', verifyToken, verifyAdmin, createPracticePath);
router.put('/:id', verifyToken, verifyAdmin, updatePracticePath);
router.delete('/:id', verifyToken, verifyAdmin, deletePracticePath);

export default router;
