const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const Registration = require("../models/Registration");
const User = require("../models/User");
const sendPasswordResetEmail = require("../utils/sendPasswordResetEmail");
const { signAuthToken } = require("../utils/authToken");

const router = express.Router();
const clean = (value) => typeof value === "string" ? value.trim() : "";
const cleanMobile = (value) => clean(value).replace(/\D/g, "");
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const FORGOT_PASSWORD_MESSAGE = "If an account exists with this email, a reset link has been sent.";
const RESET_PASSWORD_ERROR = "Unable to reset password. The link may be invalid or expired.";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dummyPasswordHash = bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);

async function registrationsFor(email) {
  return Registration.find({ email })
    .sort({ createdAt: -1 })
    .select("registrationId studentName email phone collegeName course plan amount enrollmentStatus createdAt");
}

async function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    studentName: user.name,
    email: user.email,
    mobile: user.mobile,
    phone: user.mobile,
    registrations: await registrationsFor(user.email),
  };
}

async function findLegacyRegistration(email) {
  return Registration.findOne({ email })
    .sort({ createdAt: 1 })
    .select("_id studentName email phone +password");
}

async function createMigratedUser(legacy, fallback = {}) {
  return User.create({
    name: legacy?.studentName || fallback.name,
    email: legacy?.email || fallback.email,
    mobile: legacy?.phone || fallback.mobile,
    ...(legacy?.password ? { passwordHash: legacy.password } : {}),
    legacyRegistrationId: legacy?._id || null,
  });
}

router.post("/register", async (req, res) => {
  const name = clean(req.body?.name || req.body?.studentName);
  const email = clean(req.body?.email).toLowerCase();
  const mobile = cleanMobile(req.body?.mobile || req.body?.phone);
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!name || !emailPattern.test(email) || mobile.length !== 10 || password.length < 8 || password.length > 128) {
    return res.status(400).json({ success: false, message: "Please provide valid registration details and a password of at least 8 characters." });
  }

  try {
    const legacy = await findLegacyRegistration(email);
    let user = await User.findOne({ email }).select("+passwordHash");
    const existingHash = user?.passwordHash || legacy?.password;

    if (user || legacy) {
      const passwordMatches = existingHash ? await bcrypt.compare(password, existingHash) : false;
      if (!passwordMatches) {
        return res.status(409).json({ success: false, message: "An account with this email already exists. Please login or reset your password." });
      }

      if (!user) {
        user = await createMigratedUser(legacy);
      } else if (!user.passwordHash && legacy?.password) {
        user.passwordHash = legacy.password;
        if (!user.legacyRegistrationId) user.legacyRegistrationId = legacy._id;
        await user.save();
      }

      return res.json({ success: true, token: signAuthToken(user), user: await publicUser(user) });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    user = await User.create({ name, email, mobile, passwordHash, legacyRegistrationId: null });
    const token = signAuthToken(user);
    return res.status(201).json({ success: true, token, user: await publicUser(user) });
  } catch (error) {
    console.error("Account registration failed:", error.message);
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "An account with this email already exists. Please login or reset your password." });
    }
    return res.status(500).json({ success: false, message: "Unable to create account." });
  }
});

router.post("/login", async (req, res) => {
  const email = clean(req.body?.email).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  try {
    let user = emailPattern.test(email) ? await User.findOne({ email }).select("+passwordHash") : null;
    const legacy = emailPattern.test(email) && !user?.passwordHash ? await findLegacyRegistration(email) : null;
    const candidateHash = user?.passwordHash || legacy?.password;
    const passwordMatches = await bcrypt.compare(password, candidateHash || await dummyPasswordHash);
    if (!candidateHash || !passwordMatches) {
      return res.status(401).json({ success: false, message: "Incorrect email or password." });
    }

    if (!user) {
      user = await createMigratedUser(legacy);
    } else if (!user.passwordHash && legacy?.password) {
      user.passwordHash = legacy.password;
      if (!user.legacyRegistrationId) user.legacyRegistrationId = legacy._id;
      await user.save();
    }

    return res.json({ success: true, token: signAuthToken(user), user: await publicUser(user) });
  } catch (error) {
    console.error("Login failed:", error.message);
    return res.status(401).json({ success: false, message: "Incorrect email or password." });
  }
});

router.post("/forgot-password", async (req, res) => {
  const email = clean(req.body?.email).toLowerCase();

  try {
    // Generate a token for every request so invalid and unknown emails follow the
    // same cryptographic work path. Only the SHA-256 digest is ever persisted.
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    let user = emailPattern.test(email) ? await User.findOne({ email }).select("+passwordResetTokenHash +passwordResetExpiresAt") : null;

    if (!user && emailPattern.test(email)) {
      const legacy = await findLegacyRegistration(email);
      if (legacy) {
        try {
          user = await createMigratedUser(legacy);
        } catch (error) {
          if (error?.code === 11000) {
            user = await User.findOne({ email }).select("+passwordResetTokenHash +passwordResetExpiresAt");
          } else {
            throw error;
          }
        }
      }
    }

    if (user) {
      user.passwordResetTokenHash = resetTokenHash;
      user.passwordResetExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await user.save();

      const frontendUrl = String(process.env.FRONTEND_URL || "").replace(/\/$/, "");
      if (!frontendUrl) throw new Error("FRONTEND_URL is required to create reset links.");
      const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

      try {
        await sendPasswordResetEmail(user.email, resetUrl);
      } catch (error) {
        // A link that was not delivered must not remain usable.
        await User.updateOne(
          { _id: user._id, passwordResetTokenHash: resetTokenHash },
          { $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 } }
        );
        throw error;
      }
    }
  } catch (error) {
    // Do not include the email, token, account status, or provider response in the client reply.
    console.error("Forgot password request failed:", error.message);
  }

  return res.json({ success: true, message: FORGOT_PASSWORD_MESSAGE });
});

router.post("/reset-password", async (req, res) => {
  const token = clean(req.body?.token);
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const confirmPassword = typeof req.body?.confirmPassword === "string" ? req.body.confirmPassword : "";

  if (!token || password.length < 8 || password.length > 128 || password !== confirmPassword) {
    return res.status(400).json({ success: false, message: RESET_PASSWORD_ERROR });
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const resetUser = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select("_id +passwordResetTokenHash");

    if (!resetUser) {
      return res.status(400).json({ success: false, message: RESET_PASSWORD_ERROR });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    // The token match, password replacement, token deletion, and session invalidation
    // happen in one atomic update. A concurrent replay cannot match after this succeeds.
    const user = await User.findOneAndUpdate(
      { _id: resetUser._id, passwordResetTokenHash: tokenHash, passwordResetExpiresAt: { $gt: new Date() } },
      {
        $set: { passwordHash },
        $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 },
        $inc: { sessionVersion: 1 },
      },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ success: false, message: RESET_PASSWORD_ERROR });
    }

    return res.json({ success: true, message: "Password reset successful. You can now log in with your new password." });
  } catch (error) {
    console.error("Reset password request failed:", error.message);
    return res.status(400).json({ success: false, message: RESET_PASSWORD_ERROR });
  }
});

router.get("/me", auth, async (req, res) => {
  return res.json({ success: true, user: await publicUser(req.mongoUser) });
});

module.exports = router;
