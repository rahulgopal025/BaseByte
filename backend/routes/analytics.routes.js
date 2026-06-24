import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';
import { getVisitorAnalytics } from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/visitors', verifyToken, verifyAdmin, getVisitorAnalytics);

export default router;
