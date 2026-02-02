const Announcement = require('../models/Announcement');
const User = require('../models/User');

// @desc Create announcement
// @route POST /api/announcements
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, description, content, image, visibleTo } = req.body;

    // Validation
    if (!title || !description || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and content',
      });
    }

    // Get user details to check permissions
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if officer has permission to create announcements
    if (user.role === 'officer' && !user.canCreateAnnouncement) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create announcements. Please contact the administration.',
      });
    }

    // Officers can publish directly to all visitors, admins can also publish
    const statusForRole = (user.role === 'officer' || user.role === 'admin') ? 'published' : 'draft';

    const announcement = await Announcement.create({
      title,
      description,
      content,
      image,
      author: req.user.id,
      authorRole: user.role,
      department: user.department,
      status: statusForRole,
      visibleTo: visibleTo || 'all',
      publishedAt: statusForRole === 'published' ? new Date() : null,
    });

    const populatedAnnouncement = await Announcement.findById(announcement._id).populate(
      'author',
      'firstName lastName'
    );

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcement: populatedAnnouncement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all published announcements
// @route GET /api/announcements
exports.getAnnouncements = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userRole = req.user?.role;

    const skip = (page - 1) * limit;

    // Build filter based on user role
    let filter = { status: 'published' };
    
    if (userRole === 'citizen') {
      // Citizens can see announcements visible to all or citizens
      filter.$or = [
        { visibleTo: 'all' },
        { visibleTo: 'citizens' }
      ];
    } else if (userRole === 'officer') {
      // Officers can see announcements visible to all or officers
      filter.$or = [
        { visibleTo: 'all' },
        { visibleTo: 'officers' }
      ];
    }
    // Admins see all

    const announcements = await Announcement.find(filter)
      .populate('author', 'firstName lastName')
      .populate('department', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ publishedAt: -1 });

    const total = await Announcement.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single announcement
// @route GET /api/announcements/:id
exports.getAnnouncementById = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate('author', 'firstName lastName')
      .populate('department', 'name');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    res.status(200).json({
      success: true,
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get my announcements (author)
// @route GET /api/announcements/user/my-announcements
exports.getMyAnnouncements = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const announcements = await Announcement.find({ author: req.user.id })
      .populate('author', 'firstName lastName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Announcement.countDocuments({ author: req.user.id });

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update announcement
// @route PUT /api/announcements/:id
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    // Check if user is author or admin
    if (announcement.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this announcement',
      });
    }

    const { title, description, content, image, status, visibleTo } = req.body;

    if (title) announcement.title = title;
    if (description) announcement.description = description;
    if (content) announcement.content = content;
    if (image) announcement.image = image;
    if (status) announcement.status = status;
    if (visibleTo) announcement.visibleTo = visibleTo;

    if (status === 'published' && !announcement.publishedAt) {
      announcement.publishedAt = new Date();
    }

    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Archive announcement
// @route PUT /api/announcements/:id/archive
exports.archiveAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    // Check if user is author or admin
    if (announcement.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to archive this announcement',
      });
    }

    announcement.status = 'archived';
    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement archived successfully',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete announcement
// @route DELETE /api/announcements/:id
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    // Check if user is author or admin
    if (announcement.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this announcement',
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
