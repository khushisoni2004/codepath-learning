const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", required: true, index: true },
  courseSlug: { type: String, required: true, trim: true, index: true },
  courseTitle: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: "INR" },
  status: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING", index: true },
  razorpayOrderId: { type: String, required: true, unique: true, index: true },
  razorpayPaymentId: { type: String, sparse: true, unique: true, index: true },
  razorpaySignature: String,
  receiptNumber: { type: String, sparse: true, unique: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  paidAt: Date,
}, { timestamps: true, versionKey: false });

paymentSchema.index({ userId: 1, courseSlug: 1, status: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
