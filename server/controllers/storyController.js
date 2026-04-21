const mongoose = require('mongoose');

const User = require('../models/userModel');
const Story = require('../models/storyModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const isValidStoryType = type => ['image', 'video'].includes(type);

const normalizeStoryPayload = body => {
  const mediaUrl = String(body.media_url || '').trim();
  const type = String(body.type || 'image').trim().toLowerCase();
  const caption = body.caption === undefined ? undefined : String(body.caption).trim();
  const expiresAt = body.expires_at ? new Date(body.expires_at) : new Date(Date.now() + 24 * 60 * 60 * 1000);

  return {
    media_url: mediaUrl,
    type,
    caption,
    expires_at: expiresAt,
  };
};

const validateStoryPayload = payload => {
  const errors = {};

  if (!payload.media_url) {
    errors.media_url = 'Story media URL is required';
  }

  if (!isValidStoryType(payload.type)) {
    errors.type = 'Story type must be image or video';
  }

  if (!(payload.expires_at instanceof Date) || Number.isNaN(payload.expires_at.getTime())) {
    errors.expires_at = 'A valid expiration date is required';
  } else if (payload.expires_at.getTime() <= Date.now()) {
    errors.expires_at = 'Story expiration date must be in the future';
  }

  return errors;
};

const mapStory = story => ({
  id: String(story._id),
  media_url: story.media_url,
  type: story.type,
  caption: story.caption || '',
  expires_at: new Date(story.expires_at).toISOString(),
  created_at: new Date(story.created_at).toISOString(),
  updated_at: new Date(story.updated_at).toISOString(),
  views_count: story.views_count || 0,
});

exports.getMyStories = catchAsync(async (req, res) => {
  const stories = await Story.find({ artist: req.user._id }).sort({ created_at: -1 });

  res.status(200).json({
    status: 'success',
    data: {
      stories: stories.map(mapStory),
    },
  });
});

exports.createStory = catchAsync(async (req, res) => {
  const payload = normalizeStoryPayload(req.body);
  const errors = validateStoryPayload(payload);

  if (Object.keys(errors).length) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors,
    });
  }

  const artist = await User.findById(req.user._id);

  if (!artist) {
    throw new AppError('Artist not found.', 404);
  }

  const createdStory = await Story.create({
    artist: artist._id,
    ...payload,
  });

  res.status(201).json({
    status: 'success',
    message: 'Story created successfully',
    data: {
      story: mapStory(createdStory),
    },
  });
});

exports.updateStory = catchAsync(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.storyId)) {
    return next(new AppError('Invalid story id.', 400));
  }

  const artist = await User.findById(req.user._id);

  if (!artist) {
    throw new AppError('Artist not found.', 404);
  }

  const story = await Story.findOne({
    _id: req.params.storyId,
    artist: artist._id,
  });

  if (!story) {
    throw new AppError('Story not found.', 404);
  }

  const nextValues = normalizeStoryPayload({
    media_url: req.body.media_url ?? story.media_url,
    type: req.body.type ?? story.type,
    caption: req.body.caption ?? story.caption,
    expires_at: req.body.expires_at ?? story.expires_at,
  });

  const errors = validateStoryPayload(nextValues);

  if (Object.keys(errors).length) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors,
    });
  }

  story.media_url = nextValues.media_url;
  story.type = nextValues.type;
  story.caption = nextValues.caption;
  story.expires_at = nextValues.expires_at;

  await story.save();

  res.status(200).json({
    status: 'success',
    message: 'Story updated successfully',
    data: {
      story: mapStory(story),
    },
  });
});

exports.deleteStory = catchAsync(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.storyId)) {
    return next(new AppError('Invalid story id.', 400));
  }

  const artist = await User.findById(req.user._id);

  if (!artist) {
    throw new AppError('Artist not found.', 404);
  }

  const story = await Story.findOne({
    _id: req.params.storyId,
    artist: artist._id,
  });

  if (!story) {
    throw new AppError('Story not found.', 404);
  }

  await story.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Story deleted successfully',
  });
});
