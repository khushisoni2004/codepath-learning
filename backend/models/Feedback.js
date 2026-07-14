const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  studentName: { type: String, required: true, trim: true },
  studentEmail: { type: String, required: true, trim: true, lowercase: true },
  course: { type: String, required: true, trim: true },
  ratings: {
    overall: { type: Number, required: true, min: 1, max: 5 },
    explanation: { type: Number, required: true, min: 1, max: 5 },
    content: { type: Number, required: true, min: 1, max: 5 },
    platform: { type: Number, required: true, min: 1, max: 5 },
  },
  averageRating: { type: Number, required: true, min: 1, max: 5 },
  recommendation: { type: String, required: true, enum: ["yes", "maybe", "no"] },
  likedMost: { type: String, required: true, trim: true, maxlength: 1000 },
  suggestions: { type: String, trim: true, maxlength: 1000, default: "" },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("Feedback", feedbackSchema);
