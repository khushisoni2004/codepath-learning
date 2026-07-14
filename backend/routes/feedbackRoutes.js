const express = require("express");
const auth = require("../middleware/auth");
const Feedback = require("../models/Feedback");

const router = express.Router();
const COURSES = new Set([
  "Web Development",
  "Python Programming",
  "C Programming",
  "MySQL Database",
  "Vibe Coding with AI",
  "AI Tools for Smart Projects",
]);
const RECOMMENDATIONS = new Set(["yes", "maybe", "no"]);

function cleanText(value, maximumLength = 1000) {
  return String(value || "").replace(/\0/g, "").trim().slice(0, maximumLength);
}

function feedbackView(feedback) {
  if (!feedback) return null;
  return {
    course: feedback.course,
    ratings: feedback.ratings,
    averageRating: feedback.averageRating,
    recommendation: feedback.recommendation,
    likedMost: feedback.likedMost,
    suggestions: feedback.suggestions,
    updatedAt: feedback.updatedAt,
  };
}

router.get("/me", auth, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ userId: req.user.userId });
    return res.json({ success: true, feedback: feedbackView(feedback) });
  } catch (error) {
    console.error("Load feedback error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load your feedback." });
  }
});

router.post("/", auth, async (req, res) => {
  const body = req.body || {};
  const course = cleanText(body.course, 80);
  const recommendation = cleanText(body.recommendation, 10).toLowerCase();
  const likedMost = cleanText(body.likedMost);
  const suggestions = cleanText(body.suggestions);
  const ratings = {
    overall: Number(body.ratings?.overall),
    explanation: Number(body.ratings?.explanation),
    content: Number(body.ratings?.content),
    platform: Number(body.ratings?.platform),
  };
  const validRatings = Object.values(ratings).every((rating) => Number.isInteger(rating) && rating >= 1 && rating <= 5);

  if (!COURSES.has(course) || !validRatings || !RECOMMENDATIONS.has(recommendation) || likedMost.length < 3) {
    return res.status(400).json({
      success: false,
      message: "Please answer all required feedback questions and select ratings from 1 to 5.",
    });
  }

  try {
    const averageRating = Number((Object.values(ratings).reduce((total, rating) => total + rating, 0) / 4).toFixed(2));
    const feedback = await Feedback.findOneAndUpdate(
      { userId: req.user.userId },
      {
        $set: {
          studentName: req.user.studentName,
          studentEmail: req.user.email,
          course,
          ratings,
          averageRating,
          recommendation,
          likedMost,
          suggestions,
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return res.json({ success: true, message: "Thank you! Your feedback has been saved.", feedback: feedbackView(feedback) });
  } catch (error) {
    console.error("Save feedback error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to save feedback right now." });
  }
});

module.exports = router;
