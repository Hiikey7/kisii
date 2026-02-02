const User = require('../models/User');
const Issue = require('../models/Issue');
const Department = require('../models/Department');
const { sendEmail } = require('../utils/email');
const bcrypt = require('bcryptjs');

// @desc Get admin dashboard statistics
// @route GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCitizens = await User.countDocuments({ role: 'citizen' });
    const totalOfficers = await User.countDocuments({ role: 'officer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    const totalIssues = await Issue.countDocuments();
    const pendingIssues = await Issue.countDocuments({
      status: { $in: ['pending', 'verified'] },
    });
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });

    const resolvedWithTime = await Issue.find({ status: 'resolved', resolvedAt: { $exists: true } });
    let avgResolutionTime = 0;
    if (resolvedWithTime.length > 0) {
      const totalTime = resolvedWithTime.reduce((acc, issue) => {
        const days = Math.floor(
          (new Date(issue.resolvedAt).getTime() - new Date(issue.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return acc + days;
      }, 0);
      avgResolutionTime = Math.round(totalTime / resolvedWithTime.length);
    }

    const completionRate =
      totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCitizens,
        totalOfficers,
        totalAdmins,
        totalIssues,
        pendingIssues,
        resolvedIssues,
        avgResolutionTime,
        completionRate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all users
// @route GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;

    let filter = {};
    if (role) filter.role = role;

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .populate('department', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create a new user (Admin only)
// @route POST /api/admin/users/create
exports.createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, role, department } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    const userData = {
      firstName,
      lastName,
      email,
      phone,
      role,
      password: tempPassword,
    };

    if ((role === 'officer' || role === 'admin') && department) {
      userData.department = department;
    }

    const user = await User.create(userData);

    // Send credentials email
    await sendEmail(
      email,
      'E-County System Account Created',
      `<h2>Welcome to E-County Kisii!</h2>
       <p>Your account has been created by an administrator.</p>
       <p><strong>Login Details:</strong></p>
       <p>Email: ${email}</p>
       <p>Temporary Password: ${tempPassword}</p>
       <p>Please log in and change your password immediately.</p>
       <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login">Login to your account</a></p>`
    ).catch(err => console.error('Email error:', err));

    res.status(201).json({
      success: true,
      message: 'User created successfully. Credentials sent to email.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Deactivate a user
// @route PUT /api/admin/users/:id/deactivate
exports.deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all issues for admin
// @route GET /api/admin/issues
exports.getAllIssues = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (page - 1) * limit;

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName email')
      .populate('department', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Issue.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      issues,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Verify an issue
// @route PUT /api/admin/issues/:id/verify
exports.verifyIssue = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'verified', 'assigned'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    issue.status = status;
    await issue.save();

    // Notify citizen
    const citizen = await User.findById(issue.reportedBy);
    await sendEmail(
      citizen.email,
      `Issue Status Update: ${issue.title}`,
      `<h2>Your issue has been ${status}</h2>
       <p>Issue ID: ${issue._id}</p>
       <p>Your report is being reviewed by our team.</p>`
    ).catch(err => console.error('Email error:', err));

    res.status(200).json({
      success: true,
      message: 'Issue verified successfully',
      issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Assign issue to officer
// @route PUT /api/admin/issues/:id/assign
exports.assignIssue = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Officer ID is required',
      });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    const officer = await User.findById(assignedTo);
    if (!officer || officer.role !== 'officer') {
      return res.status(400).json({
        success: false,
        message: 'Invalid officer',
      });
    }

    issue.assignedTo = assignedTo;
    issue.status = 'assigned';
    await issue.save();

    // Notify officer
    await sendEmail(
      officer.email,
      `New Issue Assignment: ${issue.title}`,
      `<h2>New Issue Assigned</h2>
       <p>An issue has been assigned to you.</p>
       <p><strong>Title:</strong> ${issue.title}</p>
       <p><strong>Category:</strong> ${issue.category}</p>
       <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/officer">View in Dashboard</a></p>`
    ).catch(err => console.error('Email error:', err));

    res.status(200).json({
      success: true,
      message: 'Issue assigned successfully',
      issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all field officers
// @route GET /api/admin/officers
exports.getOfficers = async (req, res, next) => {
  try {
    const officers = await User.find({ role: 'officer', isActive: true })
      .populate('department', 'name')
      .sort({ firstName: 1 });

    res.status(200).json({
      success: true,
      users: officers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Export reports
// @route GET /api/admin/reports/export
exports.exportReport = async (req, res, next) => {
  try {
    const { format } = req.query;

    const issues = await Issue.find()
      .populate('reportedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .populate('department', 'name');

    if (format === 'csv') {
      // Generate CSV
      const csv = [
        ['Issue ID', 'Title', 'Category', 'Status', 'Priority', 'Reported By', 'Assigned To', 'Department', 'Created At'],
        ...issues.map(issue => [
          issue._id,
          issue.title,
          issue.category,
          issue.status,
          issue.priority,
          `${issue.reportedBy?.firstName} ${issue.reportedBy?.lastName}`,
          issue.assignedTo ? `${issue.assignedTo.firstName} ${issue.assignedTo.lastName}` : 'Unassigned',
          issue.department?.name || 'N/A',
          new Date(issue.createdAt).toLocaleDateString(),
        ]),
      ]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="county-report.csv"');
      res.send(csv);
    } else if (format === 'pdf') {
      // For PDF, return JSON for now (client can use a library to generate PDF)
      res.status(200).json({
        success: true,
        message: 'PDF export data',
        data: issues,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid format. Use csv or pdf',
      });
    }
  } catch (error) {
    next(error);
  }
};
// @desc Update officer announcement permission
// @route PUT /api/admin/officers/:id/announcement-permission
exports.updateOfficerAnnouncementPermission = async (req, res, next) => {
  try {
    const { canCreateAnnouncement } = req.body;

    if (typeof canCreateAnnouncement !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'canCreateAnnouncement must be a boolean value',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'officer') {
      return res.status(400).json({
        success: false,
        message: 'User is not a field officer',
      });
    }

    user.canCreateAnnouncement = canCreateAnnouncement;
    await user.save();

    // Send email notification
    const action = canCreateAnnouncement ? 'enabled' : 'disabled';
    await sendEmail(
      user.email,
      'Announcement Permission Update',
      `<h2>Announcement Permission ${action.charAt(0).toUpperCase() + action.slice(1)}</h2>
       <p>Hello ${user.firstName} ${user.lastName},</p>
       <p>Your permission to create announcements has been ${action} by an administrator.</p>
       ${canCreateAnnouncement ? '<p>You can now log in and create announcements for the county.</p>' : '<p>You can no longer create announcements.</p>'}
       <p>If you have questions, please contact the administration.</p>`
    ).catch(err => console.error('Email error:', err));

    res.status(200).json({
      success: true,
      message: `Officer announcement permission ${action} successfully`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        canCreateAnnouncement: user.canCreateAnnouncement,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get field officers with details
// @route GET /api/admin/officers/with-permissions
exports.getOfficersWithPermissions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, canCreateAnnouncement } = req.query;

    let filter = { role: 'officer', isActive: true };
    if (canCreateAnnouncement !== undefined) {
      filter.canCreateAnnouncement = canCreateAnnouncement === 'true';
    }

    const skip = (page - 1) * limit;

    const officers = await User.find(filter)
      .populate('department', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ firstName: 1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      officers,
    });
  } catch (error) {
    next(error);
  }
};