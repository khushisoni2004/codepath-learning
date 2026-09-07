const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    posterImage: { type: String, required: true, trim: true, maxlength: 2800000 },
    published: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0, min: 0, max: 100000 },
  },
  { timestamps: true, versionKey: false }
);

achievementSchema.index({ published: 1, displayOrder: 1, createdAt: -1 });

module.exports = mongoose.model("Achievement", achievementSchema);
