import express from 'express';
import { submitFeedback, getAllFeedback } from '../controllers/feedback.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

router.post('/', verifyToken, submitFeedback);
router.get('/', verifyToken, verifyAdmin, getAllFeedback);

export default router;
