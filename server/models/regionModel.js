const mongoose = require("mongoose");

const regionSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city_id: {
      type: Number,
      required: true,
      index: true,
    },
    country_id: {
      type: Number,
      required: true,
      index: true,
    },
    country_code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

regionSchema.index({ city_id: 1, name: 1 });

module.exports = mongoose.model("Region", regionSchema);
