// Phase 2 — To be implemented
import express from 'express';
import { uploadNotes, getAllNotes, approveNotes } from '../controllers/notes.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

router.post('/upload', verifyToken, uploadNotes);
router.get('/', getAllNotes);
router.put('/approve/:id', verifyToken, verifyAdmin, approveNotes);

export default router;

