const express = require("express");
const Certificate = require("../models/Certificate");
const Counter = require("../models/Counter");

const router = express.Router();
const clean = (value, max = 180) => String(value || "").trim().slice(0, max);
const codeForCourse = (course) => {
  const text = course.toUpperCase();
  if (text.includes("PYTHON")) return "PY";
  if (text.includes("WEB")) return "WEB";
  if (text.includes("AI")) return "AI";
  if (text.includes("MYSQL")) return "SQL";
  if (text.includes("C PROGRAM")) return "C";
  return text.replace(/[^A-Z]/g, "").slice(0, 4) || "GEN";
};
const verifyAdmin = (req, res, next) => {
  if (!req.headers["x-admin-key"] || req.headers["x-admin-key"] !== process.env.ADMIN_KEY) return res.status(401).json({ success: false, message: "Invalid admin key." });
  next();
};

router.get("/verify/:certificateId", async (req, res) => {
  const certificateId = clean(req.params.certificateId).toUpperCase();
  try {
    const certificate = await Certificate.findOne({ certificateId }).lean();
    if (!certificate || certificate.status !== "VALID") return res.status(404).json({ success: true, valid: false, message: "Certificate is invalid or not found." });
    return res.json({ success: true, valid: true, certificate: { certificateId: certificate.certificateId, studentName: certificate.studentName, course: certificate.course, issueDate: certificate.issueDate, completionDate: certificate.completionDate, instructor: certificate.instructor, status: certificate.status, certificatePdf: certificate.certificatePdf || "" } });
  } catch (error) {
    console.error("Certificate verification error:", error.message);
    return res.status(500).json({ success: false, valid: false, message: "Unable to verify certificate." });
  }
});

router.post("/", verifyAdmin, async (req, res) => {
  const studentName = clean(req.body?.studentName);
  const course = clean(req.body?.course);
  const instructor = clean(req.body?.instructor || "CodePath Learning");
  const issueDate = new Date(req.body?.issueDate);
  const completionDate = new Date(req.body?.completionDate || req.body?.issueDate);
  if (!studentName || !course || !instructor || Number.isNaN(issueDate.valueOf()) || Number.isNaN(completionDate.valueOf())) return res.status(400).json({ success: false, message: "Student, course, instructor and valid dates are required." });
  try {
    const counter = await Counter.findOneAndUpdate({ name: "certificate" }, { $inc: { value: 1 } }, { new: true, upsert: true, setDefaultsOnInsert: true });
    const certificateId = `CPL-${codeForCourse(course)}-${issueDate.getFullYear()}-${String(counter.value).padStart(6, "0")}`;
    const certificate = await Certificate.create({ certificateId, studentName, course, instructor, issueDate, completionDate, certificatePdf: clean(req.body?.certificatePdf, 500) });
    const frontendOrigin = String(process.env.FRONTEND_URL || "https://www.codepathlearning.co.in").replace(/\/$/, "");
    const verificationUrl = `${frontendOrigin}/verify/${encodeURIComponent(certificateId)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(verificationUrl)}`;
    return res.status(201).json({ success: true, certificate: { ...certificate.toObject(), verificationUrl, qrUrl } });
  } catch (error) {
    console.error("Certificate creation error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to create certificate." });
  }
});

module.exports = router;
