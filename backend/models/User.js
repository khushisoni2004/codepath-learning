const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
  mobile: { type: String, trim: true, default: "" },
  legacyRegistrationId: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", default: null },
  passwordHash: { type: String, select: false, default: undefined },
  sessionVersion: { type: Number, default: 0, min: 0 },
  passwordResetTokenHash: { type: String, select: false, default: undefined },
  passwordResetExpiresAt: { type: Date, select: false, default: undefined },
}, { timestamps: true, versionKey: false });

userSchema.index({ passwordResetTokenHash: 1 }, { sparse: true });

module.exports = mongoose.model("User", userSchema);
