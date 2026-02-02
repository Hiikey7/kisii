const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'roads',
        'water',
        'waste',
        'drainage',
        'lighting',
        'health',
        'education',
        'other',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'assigned', 'en_route', 'in_progress', 'resolved'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    photos: [
      {
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    updates: [
      {
        status: String,
        comment: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        photos: [String],
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      comment: String,
      submittedAt: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: Date,
  },
  { timestamps: true }
);

// Geospatial index for map-based queries
issueSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Issue', issueSchema);
