const express = require("express");
const auth = require("../middleware/auth");
const MentorshipBooking = require("../models/MentorshipBooking");
const Payment = require("../models/Payment");

const router = express.Router();
const clean = (value, max = 500) => String(value || "").trim().slice(0, max);
const TOPICS = new Set(["Placement", "Internship", "Projects", "Resume Review", "Interview", "Career Guidance", "Higher Studies"]);

router.post("/bookings", auth, async (req, res) => {
  const courseSlug = "placement-guidance";
  const topic = clean(req.body?.topic, 80);
  const preferredDate = clean(req.body?.preferredDate, 20) || "To be scheduled";
  const preferredTime = clean(req.body?.preferredTime, 20) || "To be scheduled";
  const fullName = clean(req.mongoUser?.studentName || req.user?.studentName || req.body?.fullName, 120);
  const email = clean(req.mongoUser?.email || req.user?.email || req.body?.email, 180).toLowerCase();
  const mobile = clean(req.mongoUser?.phone || req.user?.phone || req.body?.mobile, 20) || "Not provided";
  const transactionId = clean(req.body?.transactionId, 20).replace(/\s+/g, "");
  if (!fullName || !email || !courseSlug || !TOPICS.has(topic)) {
    return res.status(400).json({ success: false, message: "Please complete the mentorship details." });
  }
  if (!/^\d{12}$/.test(transactionId)) {
    return res.status(400).json({ success: false, message: "Enter the valid 12-digit bank UTR/RRN shown after payment." });
  }

  try {
    const duplicateUtr = await Promise.all([
      MentorshipBooking.exists({ transactionId }),
      Payment.exists({ utrNumber: transactionId }),
    ]);
    if (duplicateUtr.some(Boolean)) {
      return res.status(409).json({ success: false, message: "This UTR has already been submitted." });
    }

    const booking = await MentorshipBooking.create({
      userId: req.user.userId,
      fullName,
      email,
      mobile,
      courseSlug,
      courseTitle: "Live Placement Guidance with our Founders and Co-Founders",
      topic,
      preferredDate,
      preferredTime,
      notes: clean(req.body?.notes, 1000),
      transactionId,
    });
    return res.status(201).json({ success: true, booking: { id: booking._id, status: booking.status } });
  } catch (error) {
    console.error("Mentorship booking failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to submit mentorship request." });
  }
});

router.get("/status", auth, async (req, res) => {
  try {
    // Older requests may have been saved before the auth identity migration.
    // Match both the stable account id and the authenticated email, and always
    // prefer an approved request so returning users keep their access.
    const bookings = await MentorshipBooking.find({
      $or: [
        { userId: req.user.userId },
        { email: String(req.mongoUser?.email || req.user.email || "").toLowerCase() },
      ],
    }).sort({ createdAt: -1 }).lean();
    const booking = bookings.find((item) => item.status === "PAID") || bookings[0] || null;
    return res.json({ success: true, booking: booking ? { id: booking._id, status: booking.status, verifiedAt: booking.verifiedAt } : null });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load mentorship status." });
  }
});

module.exports = router;
