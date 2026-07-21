const express = require("express");
const mongoose = require("mongoose");
const Counter = require("../models/Counter");
const Enrollment = require("../models/Enrollment");
const Payment = require("../models/Payment");
const Registration = require("../models/Registration");

const router = express.Router();

function verifyAdmin(req, res, next) {
  const adminKey = req.headers["x-admin-key"];

  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({
      success: false,
      message: "Invalid admin key.",
    });
  }

  next();
}

router.get("/payments", verifyAdmin, async (req, res) => {
  try {
    const registrations = await Registration.find({
      paymentStatus: {
        $in: ["Submitted", "Verified", "Rejected"],
      },
    }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      registrations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load payment records.",
    });
  }
});

router.patch(
  "/payments/:registrationId",
  verifyAdmin,
  async (req, res) => {
    try {
      const registrationId =
        req.params.registrationId.toUpperCase();

      const action = req.body.action;

      if (!["verify", "reject"].includes(action)) {
        return res.status(400).json({
          success: false,
          message: "Invalid action.",
        });
      }

      const update =
        action === "verify"
          ? {
              paymentStatus: "Verified",
              enrollmentStatus: "Confirmed",
              paymentVerifiedAt: new Date(),
            }
          : {
              paymentStatus: "Rejected",
              enrollmentStatus: "Pending",
              paymentVerifiedAt: null,
            };

      const registration =
        await Registration.findOneAndUpdate(
          {
            registrationId,
          },
          update,
          {
            new: true,
          }
        );

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: "Registration not found.",
        });
      }

      return res.json({
        success: true,
        message:
          action === "verify"
            ? "Payment verified successfully."
            : "Payment rejected.",
        registration,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Unable to update payment status.",
      });
    }
  }
);

router.get("/upi-payments", verifyAdmin, async (_req, res) => {
  try {
    const payments = await Payment.find({ paymentMethod: "UPI_QR" })
      .select("userId courseSlug courseTitle amount currency status utrNumber payerUpiId receiptNumber studentName studentEmail studentPhone manuallyVerifiedAt paidAt createdAt")
      .sort({ createdAt: -1 });
    return res.json({ success: true, payments });
  } catch (error) {
    console.error("Load UPI payments error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load QR payment records." });
  }
});

router.patch("/upi-payments/:paymentId", verifyAdmin, async (req, res) => {
  const action = String(req.body?.action || "").trim().toLowerCase();
  if (!mongoose.isValidObjectId(req.params.paymentId) || !["approve", "reject"].includes(action)) {
    return res.status(400).json({ success: false, message: "Invalid payment action." });
  }

  try {
    let updatedPayment;
    await mongoose.connection.transaction(async (session) => {
      const payment = await Payment.findOne({
        _id: req.params.paymentId,
        paymentMethod: "UPI_QR",
      }).session(session);
      if (!payment) return;

      if (action === "reject") {
        if (payment.status === "PAID") throw Object.assign(new Error("Paid payments cannot be rejected."), { statusCode: 409 });
        payment.status = "FAILED";
        payment.manuallyVerifiedAt = new Date();
        payment.verifiedBy = "ADMIN";
        await payment.save({ session });
        updatedPayment = payment;
        return;
      }

      if (payment.status !== "PAID") {
        const counter = await Counter.findOneAndUpdate(
          { name: "paymentReceipt" },
          { $inc: { value: 1 } },
          { new: true, upsert: true, setDefaultsOnInsert: true, session }
        );
        payment.status = "PAID";
        payment.receiptNumber = `CPL-RCPT-${new Date().getFullYear()}-${String(counter.value).padStart(6, "0")}`;
        payment.paidAt = new Date();
        payment.manuallyVerifiedAt = payment.paidAt;
        payment.verifiedBy = "ADMIN";
        await payment.save({ session });
        await Enrollment.findOneAndUpdate(
          { userId: payment.userId, courseSlug: payment.courseSlug },
          { $setOnInsert: { courseTitle: payment.courseTitle, paymentId: payment._id, enrolledAt: payment.paidAt, status: "ACTIVE" } },
          { upsert: true, new: true, session }
        );
      }
      updatedPayment = payment;
    });

    if (!updatedPayment) return res.status(404).json({ success: false, message: "QR payment not found." });
    return res.json({
      success: true,
      message: action === "approve" ? "Payment marked paid. Receipt and course access are now active." : "Payment rejected. Course access remains locked.",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Update UPI payment error:", error.message);
    return res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : "Unable to update QR payment." });
  }
});

router.get("/mentorship-bookings", verifyAdmin, async (_req, res) => {
  try {
    const MentorshipBooking = require("../models/MentorshipBooking");
    const bookings = await MentorshipBooking.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, bookings });
  } catch (error) {
    console.error("Load mentorship bookings error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load placement mentorship requests." });
  }
});

router.patch("/mentorship-bookings/:bookingId", verifyAdmin, async (req, res) => {
  const action = String(req.body?.action || "").trim().toLowerCase();
  if (!mongoose.isValidObjectId(req.params.bookingId) || !["approve", "reject"].includes(action)) {
    return res.status(400).json({ success: false, message: "Invalid mentorship action." });
  }
  try {
    const MentorshipBooking = require("../models/MentorshipBooking");
    const booking = await MentorshipBooking.findByIdAndUpdate(
      req.params.bookingId,
      action === "approve"
        ? { $set: { status: "PAID", verifiedAt: new Date(), verifiedBy: "ADMIN" } }
        : { $set: { status: "REJECTED", verifiedAt: null, verifiedBy: "ADMIN" } },
      { new: true }
    ).lean();
    if (!booking) return res.status(404).json({ success: false, message: "Mentorship request not found." });
    return res.json({ success: true, message: action === "approve" ? "Placement payment approved." : "Placement request rejected.", booking });
  } catch (error) {
    console.error("Update mentorship booking error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to update placement request." });
  }
});

module.exports = router;
