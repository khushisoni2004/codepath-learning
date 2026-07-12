const jwt = require("jsonwebtoken");
const Registration = require("../models/Registration");

module.exports = async function auth(req, res, next) {
  try {
    const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token || !process.env.JWT_SECRET) {
      return res.status(401).json({ success: false, message: "Please login to continue." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Registration.findById(payload.userId).select(
      "studentName email phone registrationId"
    );
    if (!user) {
      return res.status(401).json({ success: false, message: "Your login is no longer valid." });
    }

    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: "Please login again." });
  }
};
