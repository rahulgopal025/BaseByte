// Phase 2 — To be implemented
import express from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create', verifyToken, createOrder);
router.post('/verify', verifyToken, verifyPayment);

export default router;
