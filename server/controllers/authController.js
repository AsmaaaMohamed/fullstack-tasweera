const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('../models/userModel');
const Story = require('../models/storyModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const signToken = require('../utils/jwtHelper');

const buildCookieOptions = () => ({
  expires: new Date(
    Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000
  ),
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
});

const sanitizeUser = async user => {
  const plainUser = user.toObject ? user.toObject() : { ...user };
  const isArtist = plainUser.role === 'artist';
  const hasActiveStory = isArtist
    ? Boolean(
        await Story.exists({
          artist: plainUser._id,
          expires_at: { $gt: new Date() },
        })
      )
    : false;

  return {
    id: plainUser._id,
    _id: plainUser._id,
    name: plainUser.name,
    email: plainUser.email,
    phone: plainUser.phone,
    profile_picture_url: plainUser.profile_picture_url || null,
    country_id: plainUser.country_id,
    city_id: plainUser.city_id,
    role: plainUser.role,
    artistProfile: plainUser.artistProfile,
    average_rating: isArtist ? plainUser.artistProfile?.average_rating || '0.00' : undefined,
    ratings_count: isArtist ? plainUser.artistProfile?.ratings_count || 0 : undefined,
    years_of_experience: isArtist ? plainUser.artistProfile?.years_of_experience || 0 : undefined,
    has_active_story: hasActiveStory,
    createdAt: plainUser.createdAt,
    updatedAt: plainUser.updatedAt,
  };
};

const createAndSendToken = async (user, statusCode, res, message) => {
  const token = signToken(
    user._id,
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRES_IN || '90d'
  );

  res.cookie('jwt', token, buildCookieOptions());

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user_type: user.role,
    user: await sanitizeUser(user),
  });
};

const sendValidationError = (res, errors, statusCode = 400) =>
  res.status(statusCode).json({
    success: false,
    message: 'Validation failed',
    errors,
  });

const validateRegistrationData = (role, body) => {
  const errors = {};

  if (!body.name || !String(body.name).trim()) {
    errors.name = 'Name is required';
  }

  if (!body.email || !String(body.email).trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email).trim())) {
    errors.email = 'Please provide a valid email';
  }

  if (!body.phone || !String(body.phone).trim()) {
    errors.phone = 'Phone is required';
  }

  if (body.country_id === undefined || body.country_id === null || body.country_id === '') {
    errors.country_id = 'Country is required';
  }

  if (body.city_id === undefined || body.city_id === null || body.city_id === '') {
    errors.city_id = 'City is required';
  }

  if (!body.password) {
    errors.password = 'Password is required';
  } else if (String(body.password).length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (!body.password_confirmation) {
    errors.password_confirmation = 'Password confirmation is required';
  } else if (body.password !== body.password_confirmation) {
    errors.password_confirmation = 'Passwords do not match';
  }

  if (role === 'artist') {
    if (
      body.years_of_experience === undefined ||
      body.years_of_experience === null ||
      body.years_of_experience === ''
    ) {
      errors.years_of_experience = 'Years of experience is required';
    } else if (Number(body.years_of_experience) < 0) {
      errors.years_of_experience = 'Years of experience cannot be negative';
    }
  }

  return errors;
};

const checkUniqueFields = async ({ email, phone }) => {
  const errors = {};
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedPhone = String(phone).trim();

  const [existingEmailUser, existingPhoneUser] = await Promise.all([
    User.findOne({ email: normalizedEmail }),
    User.findOne({ phone: normalizedPhone }),
  ]);

  if (existingEmailUser) {
    errors.email = 'Email already exists';
  }

  if (existingPhoneUser) {
    errors.phone = 'Phone already exists';
  }

  return errors;
};

const register = role =>
  catchAsync(async (req, res) => {
    const errors = validateRegistrationData(role, req.body);

    if (Object.keys(errors).length) {
      return sendValidationError(res, errors);
    }

    const uniqueErrors = await checkUniqueFields(req.body);

    if (Object.keys(uniqueErrors).length) {
      return sendValidationError(res, uniqueErrors, 409);
    }

    const user = await User.create({
      name: String(req.body.name).trim(),
      email: String(req.body.email).trim().toLowerCase(),
      phone: String(req.body.phone).trim(),
      country_id: Number(req.body.country_id),
      city_id: Number(req.body.city_id),
      password: req.body.password,
      role,
      artistProfile:
        role === 'artist'
          ? {
              years_of_experience: Number(req.body.years_of_experience),
            }
          : undefined,
    });

    await createAndSendToken(user, 201, res, 'Registration successful');
  });

const loginWithEmail = role =>
  catchAsync(async (req, res) => {
    const errors = {};

    if (!req.body.email || !String(req.body.email).trim()) {
      errors.email = 'Email is required';
    }

    if (!req.body.password) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length) {
      return sendValidationError(res, errors);
    }

    const user = await User.findOne({
      email: String(req.body.email).trim().toLowerCase(),
      role,
    }).select('+password');

    if (!user || !(await user.correctPassword(req.body.password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errors: {
          _general: 'Invalid email or password',
        },
      });
    }

    await createAndSendToken(user, 200, res, 'Login successful');
  });

exports.registerCustomer = register('customer');
exports.registerArtist = register('artist');
exports.loginCustomerWithEmail = loginWithEmail('customer');
exports.loginArtistWithEmail = loginWithEmail('artist');

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }

  next();
};

exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    user: await sanitizeUser(req.user),
  });
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'logged-out', {
    ...buildCookieOptions(),
    expires: new Date(Date.now() + 10 * 1000),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
