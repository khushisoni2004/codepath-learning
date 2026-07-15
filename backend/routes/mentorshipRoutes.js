const express = require("express");
const auth = require("../middleware/auth");
const MentorshipBooking = require("../models/MentorshipBooking");

const router = express.Router();
const clean = (value, max = 500) => String(value || "").trim().slice(0, max);
const TOPICS = new Set(["Placement", "Internship", "Projects", "Resume Review", "Interview", "Career Guidance", "Higher Studies"]);

router.post("/bookings", auth, async (req, res) => {
  const courseSlug = "placement-guidance";
  const topic = clean(req.body?.topic, 80);
  const preferredDate = clean(req.body?.preferredDate, 20);
  const preferredTime = clean(req.body?.preferredTime, 20);
  const fullName = clean(req.body?.fullName, 120);
  const email = clean(req.body?.email, 180).toLowerCase();
  const mobile = clean(req.body?.mobile, 20);
  if (!fullName || !email || !mobile || !courseSlug || !preferredDate || !preferredTime || !TOPICS.has(topic)) {
    return res.status(400).json({ success: false, message: "Please complete the mentorship details." });
  }

  try {
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
      transactionId: clean(req.body?.transactionId, 120),
      payerUpiId: clean(req.body?.payerUpiId, 180).toLowerCase(),
    });
    return res.status(201).json({ success: true, booking: { id: booking._id, status: booking.status } });
  } catch (error) {
    console.error("Mentorship booking failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to submit mentorship request." });
  }
});

router.get("/status", auth, async (req, res) => {
  try {
    const booking = await MentorshipBooking.findOne({ userId: req.user.userId }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, booking: booking ? { id: booking._id, status: booking.status, verifiedAt: booking.verifiedAt } : null });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load mentorship status." });
  }
});

module.exports = router;
