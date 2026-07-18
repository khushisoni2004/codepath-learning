const express = require("express");

const router = express.Router();
router.get("/", (_req, res) => res.json({
  success: true,
  enterpriseName: "CODEPATH LEARNING",
  udyamRegistrationNumber: "UDYAM-MP-22-0041513",
  enterpriseType: "Micro",
  majorActivity: "Services",
  businessCategory: "OBC",
  registrationDate: "18/07/2026",
  incorporationDate: "13/07/2026",
  unitName: "CodePath Learning – Online Training Unit",
  nic: { twoDigit: "85 - Education", fourDigit: "8549 - Other education n.e.c.", fiveDigit: "85499 - Other educational services n.e.c.", activity: "Services" },
  certificateUrl: "/documents/udyam-msme-certificate.pdf",
  qrUrl: "/documents/udyam-msme-qr.png",
}));

module.exports = router;
