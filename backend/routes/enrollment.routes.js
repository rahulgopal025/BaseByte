import express from 'express';
import {
  requestEnrollment,
  getPendingEnrollments,
  updateEnrollmentStatus,
  getMyEnrollments,
  checkEnrollment
} from '../controllers/enrollment.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

router.post('/request', verifyToken, requestEnrollment);
router.get('/my', verifyToken, getMyEnrollments);
router.get('/check/:courseId', verifyToken, checkEnrollment);
router.get('/pending', verifyToken, verifyAdmin, getPendingEnrollments);
router.put('/status', verifyToken, verifyAdmin, updateEnrollmentStatus);

export default router;
