const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, unique: true, index: true, trim: true, uppercase: true },
    studentName: { type: String, required: true, trim: true, maxlength: 160 },
    course: { type: String, required: true, trim: true, maxlength: 160 },
    issueDate: { type: Date, required: true },
    completionDate: { type: Date, required: true },
    instructor: { type: String, required: true, trim: true, maxlength: 160 },
    status: { type: String, enum: ["VALID", "REVOKED"], default: "VALID", index: true },
    certificatePdf: { type: String, trim: true, default: "" },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Certificate", certificateSchema);
