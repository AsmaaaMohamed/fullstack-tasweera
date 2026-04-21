const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Artist is required'],
      index: true,
    },
    media_url: {
      type: String,
      required: [true, 'Story media URL is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [300, 'Story caption cannot exceed 300 characters'],
    },
    expires_at: {
      type: Date,
      required: [true, 'Story expiration date is required'],
      index: true,
    },
    views_count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

module.exports = mongoose.model('Story', storySchema);
