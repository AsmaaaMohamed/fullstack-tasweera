const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema(
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
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    dialCode: {
      type: String,
      trim: true,
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

countrySchema.index({ code: 1 }, { unique: true });
countrySchema.index({ name: 1 });

module.exports = mongoose.model("Country", countrySchema);
