import express from 'express';
import { getQuizByLangAndTopic } from '../controllers/quiz.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:lang/:topic', verifyToken, getQuizByLangAndTopic);

export default router;