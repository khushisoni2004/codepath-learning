const express = require("express");
const Registration = require("../models/Registration");
const LoginLog = require("../models/LoginLog");
const generateRegistrationId = require("../utils/generateRegistrationId");

const router = express.Router();

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanPhone(value) {
  return clean(value).replace(/\D/g, "");
}

router.post("/", async (req, res) => {
  try {
    const studentName = clean(req.body.studentName || req.body.name);
    const email = clean(req.body.email).toLowerCase();
    const phone = cleanPhone(req.body.phone || req.body.whatsapp);
    const collegeName = clean(req.body.collegeName || req.body.college);
    const course = clean(req.body.course);
    const plan = clean(req.body.plan || "Complete Learning Plan - ₹599");

    if (!studentName || !email || !phone || !course) {
      return res.status(400).json({
        success: false,
        message: "Please fill student name, email, WhatsApp number and course.",
      });
    }

    if (phone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit WhatsApp number.",
      });
    }

    const existing = await Registration.findOne({
      email,
      phone,
      course,
      enrollmentStatus: { $ne: "Cancelled" },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You are already registered for this course. Please login to view your details.",
        registrationId: existing.registrationId,
        registration: existing,
      });
    }

    const registrationId = await generateRegistrationId();

    const registration = await Registration.create({
      registrationId,
      studentName,
      email,
      phone,
      collegeName,
      course,
      plan,
      amount: 599,
      enrollmentStatus: "Registered",
    });

    return res.status(201).json({
      success: true,
      message: "Registration completed successfully.",
      registrationId,
      registration,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete registration.",
      error: error.message,
    });
  }
});

router.get("/verify/:registrationId", async (req, res) => {
  try {
    const registrationId = clean(req.params.registrationId).toUpperCase();

    const registration = await Registration.findOne({ registrationId }).select(
      "registrationId studentName email phone collegeName course plan amount enrollmentStatus createdAt"
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: "Registration ID not found.",
      });
    }

    return res.json({
      success: true,
      verified: true,
      valid: true,
      registration,
    });
  } catch (error) {
    console.error("Verify error:", error);

    return res.status(500).json({
      success: false,
      verified: false,
      message: "Unable to verify registration.",
    });
  }
});

module.exports = router;
