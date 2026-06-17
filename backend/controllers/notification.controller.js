import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Notification from '../models/Notification.js';

// @desc    Get all notifications for logged in user (global + targeted)
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Fetch global notifications OR targeted to this user
  const notifications = await Notification.find({
    $or: [
      { isGlobal: true },
      { userId: userId }
    ]
  }).sort({ createdAt: -1 }).limit(50);

  // Map to include a boolean `isRead` based on `readBy` array
  const mappedNotifications = notifications.map(notif => {
    const isRead = notif.readBy && notif.readBy.includes(userId);
    return {
      _id: notif._id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      link: notif.link,
      createdAt: notif.createdAt,
      isRead: isRead
    };
  });

  res.json(new ApiResponse(200, mappedNotifications, 'Notifications fetched'));
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const notificationId = req.params.id;
  const userId = req.user.id;

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  // Add userId to readBy array if not already present
  if (!notification.readBy.includes(userId)) {
    notification.readBy.push(userId);
    await notification.save();
  }

  res.json(new ApiResponse(200, {}, 'Notification marked as read'));
});

// @desc    Admin: Create a new notification (broadcast)
// @route   POST /api/notifications
// @access  Private/Admin
export const createNotification = asyncHandler(async (req, res) => {
  const { title, message, type, link } = req.body;

  if (!title || !message) {
    throw new ApiError(400, 'Title and message are required');
  }

  const notification = await Notification.create({
    title,
    message,
    type: type || 'SYSTEM',
    isGlobal: true,
    link: link || ''
  });

  res.status(201).json(new ApiResponse(201, notification, 'Notification sent to all users'));
});

// @desc    Admin: Get all notifications
// @route   GET /api/notifications/admin
// @access  Private/Admin
export const getAllAdminNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({}).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, notifications, 'Admin notifications fetched'));
});

// @desc    Admin: Update a notification
// @route   PUT /api/notifications/:id
// @access  Private/Admin
export const updateNotification = asyncHandler(async (req, res) => {
  const { title, message, type, link } = req.body;
  const notificationId = req.params.id;

  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { title, message, type, link },
    { new: true, runValidators: true }
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  res.json(new ApiResponse(200, notification, 'Notification updated successfully'));
});

// @desc    Admin: Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
export const deleteNotification = asyncHandler(async (req, res) => {
  const notificationId = req.params.id;

  const notification = await Notification.findByIdAndDelete(notificationId);
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  res.json(new ApiResponse(200, {}, 'Notification deleted successfully'));
});

