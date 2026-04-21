const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const artistProfileSchema = new mongoose.Schema(
  {
    years_of_experience: {
      type: Number,
      min: [0, 'Years of experience cannot be negative'],
    },
    average_rating: {
      type: String,
      default: '0.00',
      trim: true,
    },
    ratings_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    artist_type: String,
    section_ids: [Number],
    onboarding_completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true,
      trim: true,
    },
    profile_picture_url: {
      type: String,
      trim: true,
      default: null,
    },
    country_id: {
      type: Number,
      required: [true, 'Country is required'],
    },
    city_id: {
      type: Number,
      required: [true, 'City is required'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'artist'],
      required: [true, 'Role is required'],
    },
    artistProfile: artistProfileSchema,
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
