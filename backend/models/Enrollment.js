const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", required: true },
  courseSlug: { type: String, required: true, trim: true },
  courseTitle: { type: String, required: true, trim: true },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
  enrolledAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["ACTIVE"], default: "ACTIVE" },
}, { timestamps: true, versionKey: false });

enrollmentSchema.index({ userId: 1, courseSlug: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
