import express from 'express';
import { signup, login, logout, refreshToken } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validateSignup, validateLogin } from '../middleware/validate.middleware.js';

const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);
router.post('/logout', verifyToken, logout);

export default router;