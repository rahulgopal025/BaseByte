import express from 'express';
import { getLecturesByCourse, addLecture, updateLecture, deleteLecture } from '../controllers/lecture.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

router.get('/:courseId', verifyToken, getLecturesByCourse);
router.post('/', verifyToken, verifyAdmin, addLecture);
router.put('/:id', verifyToken, verifyAdmin, updateLecture);
router.delete('/:id', verifyToken, verifyAdmin, deleteLecture);

export default router;
