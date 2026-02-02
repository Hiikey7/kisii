const express = require('express');
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  getMyAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  archiveAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);

// Officer and Admin routes
router.post('/', protect, authorize('officer', 'admin'), createAnnouncement);
router.get('/user/my-announcements', protect, authorize('officer', 'admin'), getMyAnnouncements);
router.put('/:id', protect, authorize('officer', 'admin'), updateAnnouncement);
router.put('/:id/archive', protect, authorize('officer', 'admin'), archiveAnnouncement);
router.delete('/:id', protect, authorize('officer', 'admin'), deleteAnnouncement);

module.exports = router;
