import express from 'express';
import { getAllProblems, getProblemById } from '../controllers/problem.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getAllProblems);
router.get('/:id', verifyToken, getProblemById);

export default router;