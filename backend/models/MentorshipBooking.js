const mongoose = require("mongoose");

const mentorshipBookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 180 },
    mobile: { type: String, required: true, trim: true, maxlength: 20 },
    courseSlug: { type: String, required: true, trim: true, maxlength: 80 },
    courseTitle: { type: String, required: true, trim: true, maxlength: 160 },
    topic: { type: String, required: true, trim: true, maxlength: 80 },
    preferredDate: { type: String, required: true, trim: true, maxlength: 20 },
    preferredTime: { type: String, required: true, trim: true, maxlength: 20 },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
    transactionId: { type: String, trim: true, uppercase: true, maxlength: 120, default: "" },
    payerUpiId: { type: String, trim: true, lowercase: true, maxlength: 180, default: "" },
    status: { type: String, enum: ["PENDING", "PAID", "REJECTED"], default: "PENDING", index: true },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MentorshipBooking", mentorshipBookingSchema);
