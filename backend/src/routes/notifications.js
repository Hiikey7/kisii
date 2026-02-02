const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes - user must be logged in
// Specific routes first (before parameterized routes)
router.get('/count/unread', protect, getUnreadCount);
router.put('/read-all', protect, markAllAsRead);

// Parameterized routes
router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
