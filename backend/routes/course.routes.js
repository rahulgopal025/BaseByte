import express from 'express';
import { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse, getCourseProblems, getCourseNotes } from '../controllers/course.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.get('/:id/problems', getCourseProblems);
router.get('/:id/notes', getCourseNotes);
router.post('/', verifyToken, verifyAdmin, createCourse);
router.put('/:id', verifyToken, verifyAdmin, updateCourse);
router.delete('/:id', verifyToken, verifyAdmin, deleteCourse);

export default router;
