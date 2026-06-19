import express from 'express';
import { saveProfile, getProfile, updateAccountSettings } from '../controllers/profile.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/save', verifyToken, saveProfile);
router.get('/me', verifyToken, getProfile);
router.put('/account', verifyToken, updateAccountSettings);

export default router;