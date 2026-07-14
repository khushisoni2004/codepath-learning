const User = require("../models/User");
const { verifyAuthToken } = require("../utils/authToken");

module.exports = async function auth(req, res, next) {
  try {
    const authorization = String(req.headers.authorization || "");
    const token = authorization.replace(/^Bearer\s+/i, "").trim();
    if (!token || token === authorization) {
      return res.status(401).json({ success: false, message: "Please login to continue." });
    }

    const decoded = verifyAuthToken(token);
    const user = await User.findById(decoded.sub);
    if (!user || (user.sessionVersion || 0) !== decoded.sessionVersion) {
      return res.status(401).json({ success: false, message: "Please login again." });
    }

    const paymentOwnerId = user.legacyRegistrationId || user._id;
    req.mongoUser = user;
    req.user = {
      _id: paymentOwnerId,
      userId: user._id,
      studentName: user.name,
      name: user.name,
      email: user.email,
      phone: user.mobile,
      mobile: user.mobile,
    };
    return next();
  } catch (error) {
    console.error("Authentication failed:", error.message);
    return res.status(401).json({ success: false, message: "Please login again." });
  }
};
