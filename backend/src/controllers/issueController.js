const Issue = require('../models/Issue');
const User = require('../models/User');
const Department = require('../models/Department');
const { sendEmail } = require('../utils/email');

// Category to Department mapping
const categoryToDepartment = {
  roads: 'Roads & Transport',
  water: 'Water & Sanitation',
  waste: 'Waste Management',
  drainage: 'Waste Management',
  lighting: 'Electricity',
  health: 'Health',
  education: 'Education',
  other: 'Roads & Transport', // Default
};

// @desc Automatically assign issue to officers in relevant department
const assignIssueToDepartment = async (categoryName) => {
  try {
    const departmentName = categoryToDepartment[categoryName] || 'Roads & Transport';
    const department = await Department.findOne({ name: departmentName, isActive: true });
    
    if (!department) {
      console.error(`Department not found for category: ${categoryName}`);
      return { department: null, assignedTo: null };
    }

    // Find available officers in this department
    const officer = await User.findOne({
      department: department._id,
      role: 'officer',
      isActive: true,
    });

    return { department: department._id, assignedTo: officer?._id || null };
  } catch (error) {
    console.error('Error assigning issue to department:', error);
    return { department: null, assignedTo: null };
  }
};

// @desc Create a new issue
// @route POST /api/issues
exports.createIssue = async (req, res, next) => {
  try {
    const { title, description, category, longitude, latitude, address } = req.body;

    // Validation
    if (!title || !description || !category || !longitude || !latitude || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Verify coordinates are valid
    if (isNaN(longitude) || isNaN(latitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates provided',
      });
    }

    // Auto-assign to appropriate department and officer
    const { department, assignedTo } = await assignIssueToDepartment(category);

    const issue = await Issue.create({
      title,
      description,
      category,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address,
      },
      reportedBy: req.user.id,
      department: department,
      assignedTo: assignedTo,
      status: assignedTo ? 'assigned' : 'pending',
    });

    // Populate references
    await issue.populate('reportedBy', 'firstName lastName email phone');
    await issue.populate('assignedTo', 'firstName lastName email');
    await issue.populate('department', 'name');

    // Send confirmation email to citizen
    const citizen = await User.findById(req.user.id);
    await sendEmail(
      citizen.email,
      'Issue Report Submitted Successfully',
      `<h2>Thank you for reporting!</h2>
       <p>Your issue has been received and will be reviewed shortly.</p>
       <p>Issue ID: ${issue._id}</p>
       <p>Category: ${category}</p>
       <p>Status: ${issue.status}</p>
       <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/issues/${issue._id}">View your report</a></p>`
    ).catch(err => console.error('Email error:', err));

    // Send assignment email to officer if assigned
    if (assignedTo) {
      const officer = await User.findById(assignedTo);
      await sendEmail(
        officer.email,
        `New Issue Assigned: ${title}`,
        `<h2>New Issue Assignment</h2>
         <p>An issue has been assigned to you.</p>
         <p><strong>Title:</strong> ${title}</p>
         <p><strong>Category:</strong> ${category}</p>
         <p><strong>Description:</strong> ${description}</p>
         <p><strong>Location:</strong> ${address}</p>
         <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/officer">View in Dashboard</a></p>`
      ).catch(err => console.error('Email error:', err));
    }

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully and assigned to department',
      issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all issues
// @route GET /api/issues
exports.getIssues = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (page - 1) * limit;

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName email')
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

// @desc Get single issue by ID
// @route GET /api/issues/:id
exports.getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName email')
      .populate('updates.updatedBy', 'firstName lastName');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    res.status(200).json({
      success: true,
      issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get issues reported by citizen
// @route GET /api/issues/user/my-issues
exports.getMyIssues = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let filter = { reportedBy: req.user.id };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const issues = await Issue.find(filter)
      .populate('assignedTo', 'firstName lastName email')
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

// @desc Update issue status
// @route PUT /api/issues/:id/status
exports.updateIssueStatus = async (req, res, next) => {
  try {
    const { status, comment, photos } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Add update to updates array
    issue.updates.push({
      status: status || issue.status,
      comment,
      updatedBy: req.user.id,
      photos: photos || [],
      timestamp: new Date(),
    });

    issue.status = status || issue.status;

    if (status === 'resolved') {
      issue.resolvedAt = new Date();
    }

    await issue.save();

    // Notify citizen of status update
    const citizen = await User.findById(issue.reportedBy);
    await sendEmail(
      citizen.email,
      `Issue Update: ${issue.title}`,
      `<h2>Your issue status has been updated!</h2>
       <p>New Status: <strong>${status}</strong></p>
       <p>${comment || 'No additional comment'}</p>
       <p><a href="${process.env.FRONTEND_URL}/issues/${issue._id}">View full details</a></p>`
    );

    res.status(200).json({
      success: true,
      message: 'Issue status updated',
      issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get issues assigned to officer
// @route GET /api/issues/officer/assigned
exports.getAssignedIssues = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Get the officer's user details including department
    const officer = await User.findById(req.user.id).populate('department');
    
    if (!officer) {
      return res.status(404).json({
        success: false,
        message: 'Officer not found',
      });
    }

    // Create filter for issues assigned to this officer or assigned to their department
    let filter = {
      $or: [
        { assignedTo: req.user.id }, // Directly assigned to officer
        { department: officer.department?._id }, // Assigned to officer's department
      ],
    };
    
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName email')
      .populate('department', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Issue.countDocuments(filter);

    // Log for debugging
    console.log(`Officer ${officer._id} retrieved ${issues.length} issues from department ${officer.department?.name}`);

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
// @desc Add comment to issue
// @route POST /api/issues/:id/comments
exports.addComment = async (req, res, next) => {
  try {
    const { comment, photos } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required',
      });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Verify officer is assigned to this issue
    if (issue.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this issue',
      });
    }

    issue.updates.push({
      comment,
      updatedBy: req.user.id,
      photos: photos || [],
      timestamp: new Date(),
    });

    await issue.save();
    const updatedIssue = await Issue.findById(issue._id).populate('updates.updatedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      issue: updatedIssue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get officer workload and statistics
// @route GET /api/issues/officer/stats
exports.getOfficerStats = async (req, res, next) => {
  try {
    const officerId = req.user.id;

    const total = await Issue.countDocuments({ assignedTo: officerId });
    const enRoute = await Issue.countDocuments({ assignedTo: officerId, status: 'en_route' });
    const inProgress = await Issue.countDocuments({ assignedTo: officerId, status: 'in_progress' });
    const resolved = await Issue.countDocuments({ assignedTo: officerId, status: 'resolved' });

    res.status(200).json({
      success: true,
      stats: {
        total,
        enRoute,
        inProgress,
        resolved,
        pending: total - enRoute - inProgress - resolved,
      },
    });
  } catch (error) {
    next(error);
  }
};