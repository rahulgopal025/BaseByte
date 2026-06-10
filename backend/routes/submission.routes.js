import express from 'express';
import { saveSubmission, getMySubmissions } from '../controllers/submission.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, saveSubmission);
router.get('/:problemId', verifyToken, getMySubmissions);

export default router;
