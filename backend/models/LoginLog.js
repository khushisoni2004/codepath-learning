const mongoose = require("mongoose");

const loginLogSchema = new mongoose.Schema(
  {
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

    studentName: {
      type: String,
      trim: true,
      default: "",
    },

    registrationIds: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },

    message: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("LoginLog", loginLogSchema);
