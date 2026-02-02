const express = require('express');
const {
  createIssue,
  getIssues,
  getIssueById,
  getMyIssues,
  updateIssueStatus,
  getAssignedIssues,
  addComment,
  getOfficerStats,
} = require('../controllers/issueController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route - view all issues
router.get('/', getIssues);

// Citizen routes
router.post('/', protect, authorize('citizen'), createIssue);
router.get('/user/my-issues', protect, authorize('citizen'), getMyIssues);

// Officer routes
router.get('/officer/assigned', protect, authorize('officer'), getAssignedIssues);
router.get('/officer/stats', protect, authorize('officer'), getOfficerStats);
router.post('/:id/comments', protect, authorize('officer'), addComment);
router.put('/:id/status', protect, authorize('officer', 'admin'), updateIssueStatus);

// Common route
router.get('/:id', getIssueById);

module.exports = router;

module.exports = router;
