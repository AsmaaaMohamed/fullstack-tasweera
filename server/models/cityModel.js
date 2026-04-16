const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
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
    geonameId: {
      type: Number,
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

citySchema.index({ country_id: 1, name: 1 });
citySchema.index({ country_code: 1, name: 1 });

module.exports = mongoose.model("City", citySchema);
