import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';
import { getNotifications, markAsRead, createNotification, getAllAdminNotifications, updateNotification, deleteNotification } from '../controllers/notification.controller.js';

const router = express.Router();

// User routes
router.get('/', verifyToken, getNotifications);
router.put('/:id/read', verifyToken, markAsRead);

// Admin routes
router.get('/admin', verifyToken, verifyAdmin, getAllAdminNotifications);
router.post('/', verifyToken, verifyAdmin, createNotification);
router.put('/:id', verifyToken, verifyAdmin, updateNotification);
router.delete('/:id', verifyToken, verifyAdmin, deleteNotification);

export default router;
