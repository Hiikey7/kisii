const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/email');

// @desc Get user notifications
// @route GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const { isRead, page = 1, limit = 10 } = req.query;

    let filter = { recipient: req.user.id };
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(filter)
      .populate('issue', 'title category status')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get unread notification count
// @route GET /api/notifications/count/unread
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Mark notification as read
// @route PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Mark all notifications as read
// @route PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete notification
// @route DELETE /api/notifications/:id
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    next(error);
  }
};

// Internal function: Create notification for issue assignment
exports.createAssignmentNotification = async (officer, issue) => {
  try {
    const notification = await Notification.create({
      recipient: officer._id,
      type: 'issue_assigned',
      issue: issue._id,
      title: `New Issue Assigned: ${issue.title}`,
      message: `A new issue has been assigned to you. Category: ${issue.category}. Priority: ${issue.priority}`,
    });

    // Send email to officer
    await sendEmail(
      officer.email,
      notification.title,
      `<h2>${notification.title}</h2>
       <p>${notification.message}</p>
       <p><strong>Location:</strong> ${issue.location.address}</p>
       <p><strong>Description:</strong> ${issue.description}</p>
       <p><a href="${process.env.FRONTEND_URL}/officer/issues/${issue._id}">View Issue Details</a></p>`
    );

    return notification;
  } catch (error) {
    console.error('Error creating assignment notification:', error);
  }
};

// Internal function: Create notification for status update
exports.createStatusUpdateNotification = async (officer, issue, newStatus) => {
  try {
    const notification = await Notification.create({
      recipient: issue.reportedBy,
      type: 'status_updated',
      issue: issue._id,
      title: `Issue Status Update: ${issue.title}`,
      message: `Your issue status has been updated to: ${newStatus}`,
    });

    return notification;
  } catch (error) {
    console.error('Error creating status update notification:', error);
  }
};
