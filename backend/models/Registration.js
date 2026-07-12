const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      select: false,
    },

    collegeName: {
      type: String,
      trim: true,
      default: "",
    },

    course: {
      type: String,
      required: true,
      trim: true,
    },

    plan: {
      type: String,
      required: true,
      trim: true,
      default: "Complete Learning Plan - ₹599",
    },

    amount: {
      type: Number,
      default: 599,
    },

    enrollmentStatus: {
      type: String,
      enum: ["Registered", "Confirmed", "Completed", "Cancelled"],
      default: "Registered",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

registrationSchema.index({ email: 1, phone: 1 });
registrationSchema.index({ email: 1, course: 1 });

module.exports = mongoose.model("Registration", registrationSchema);
