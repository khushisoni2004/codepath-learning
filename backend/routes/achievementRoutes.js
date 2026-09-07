const express = require("express");
const mongoose = require("mongoose");
const Achievement = require("../models/Achievement");

const router = express.Router();

function verifyAdmin(req, res, next) {
  if (!req.headers["x-admin-key"] || req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, message: "Invalid admin key." });
  }
  return next();
}

function validPoster(value) {
  const poster = String(value || "").trim();
  const match = poster.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) throw Object.assign(new Error("Poster must be a JPG, PNG or WEBP image."), { statusCode: 400 });
  if (Buffer.byteLength(match[2], "base64") > 2 * 1024 * 1024) {
    throw Object.assign(new Error("Poster must be 2 MB or smaller."), { statusCode: 400 });
  }
  return poster;
}

function payload(body) {
  const displayOrder = Number(body?.displayOrder || 0);
  if (!Number.isInteger(displayOrder) || displayOrder < 0 || displayOrder > 100000) {
    throw Object.assign(new Error("Display order must be a whole number from 0 to 100000."), { statusCode: 400 });
  }
  return {
    posterImage: validPoster(body?.posterImage),
    published: body?.published !== false,
    displayOrder,
  };
}

router.get("/", async (_req, res) => {
  try {
    const achievements = await Achievement.find({ published: true }).sort({ displayOrder: 1, createdAt: -1 }).lean();
    return res.json({ success: true, achievements });
  } catch (error) {
    console.error("Load achievement posters error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load achievement posters." });
  }
});

router.get("/admin", verifyAdmin, async (_req, res) => {
  try {
    const achievements = await Achievement.find({}).sort({ displayOrder: 1, createdAt: -1 }).lean();
    return res.json({ success: true, achievements });
  } catch (error) {
    console.error("Load admin achievement posters error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load achievement posters." });
  }
});

router.post("/admin", verifyAdmin, async (req, res) => {
  try {
    const achievement = await Achievement.create(payload(req.body));
    return res.status(201).json({ success: true, achievement });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : "Unable to save poster." });
  }
});

router.put("/admin/:achievementId", verifyAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.achievementId)) return res.status(400).json({ success: false, message: "Invalid poster." });
  try {
    const achievement = await Achievement.findByIdAndUpdate(req.params.achievementId, payload(req.body), { new: true, runValidators: true }).lean();
    if (!achievement) return res.status(404).json({ success: false, message: "Poster not found." });
    return res.json({ success: true, achievement });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : "Unable to update poster." });
  }
});

router.delete("/admin/:achievementId", verifyAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.achievementId)) return res.status(400).json({ success: false, message: "Invalid poster." });
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.achievementId).lean();
    if (!achievement) return res.status(404).json({ success: false, message: "Poster not found." });
    return res.json({ success: true, message: "Poster deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to delete poster." });
  }
});

module.exports = router;
