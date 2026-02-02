const express = require('express');
const {
  getStats,
  getUsers,
  createUser,
  deactivateUser,
  getAllIssues,
  verifyIssue,
  assignIssue,
  getOfficers,
  getOfficersWithPermissions,
  updateOfficerAnnouncementPermission,
  exportReport,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes - admin only
router.use(protect, authorize('admin'));

// Stats and Analytics
router.get('/stats', getStats);

// User Management
router.get('/users', getUsers);
router.post('/users/create', createUser);
router.put('/users/:id/deactivate', deactivateUser);

// Issue Management
router.get('/issues', getAllIssues);
router.put('/issues/:id/verify', verifyIssue);
router.put('/issues/:id/assign', assignIssue);

// Officers Management
router.get('/officers', getOfficers);
router.get('/officers/with-permissions', getOfficersWithPermissions);
router.put('/officers/:id/announcement-permission', updateOfficerAnnouncementPermission);
// Reports
router.get('/reports/export', exportReport);

module.exports = router;