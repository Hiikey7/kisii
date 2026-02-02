const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// @desc Get all departments
// @route GET /api/departments
router.get('/', async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).select('_id name description');
    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    next(error);
  }
});

// @desc Get single department
// @route GET /api/departments/:id
router.get('/:id', async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate('manager', 'firstName lastName email');
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
