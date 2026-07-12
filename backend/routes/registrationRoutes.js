const express = require("express");
const Registration = require("../models/Registration");
const LoginLog = require("../models/LoginLog");
const generateRegistrationId = require("../utils/generateRegistrationId");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const router = express.Router();
const SAFE_REGISTRATION_FIELDS =
  "registrationId studentName email phone collegeName course plan amount enrollmentStatus createdAt";

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanPhone(value) {
  return clean(value).replace(/\D/g, "");
}

function normalizeRegistration(registration) {
  return {
    id: String(registration._id),
    registrationId: registration.registrationId,
    studentName: registration.studentName,
    name: registration.studentName,
    email: registration.email,
    phone: registration.phone,
    mobile: registration.phone,
    collegeName: registration.collegeName,
    course: registration.course,
    plan: registration.plan,
    amount: registration.amount,
    enrollmentStatus: registration.enrollmentStatus,
    createdAt: registration.createdAt,
  };
}

function makeToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required.");
  }

  return jwt.sign({ userId: String(userId) }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function authResponse(registration, registrations = [registration]) {
  const safeRegistration = normalizeRegistration(registration);
  const safeRegistrations = registrations.map(normalizeRegistration);

  return {
    token: makeToken(registration._id),
    user: {
      id: safeRegistration.id,
      name: safeRegistration.studentName,
      email: safeRegistration.email,
      mobile: safeRegistration.phone,
    },
    studentName: safeRegistration.studentName,
    email: safeRegistration.email,
    phone: safeRegistration.phone,
    registrations: safeRegistrations,
  };
}

async function registerStudent(req, res) {
  try {
    const studentName = clean(req.body.studentName || req.body.name);
    const email = clean(req.body.email).toLowerCase();
    const phone = cleanPhone(req.body.phone || req.body.whatsapp);
    const collegeName = clean(req.body.collegeName || req.body.college);
    const course = clean(req.body.course);
    const plan = clean(req.body.plan || "Complete Learning Plan - ₹599");
    const password = clean(req.body.password);
    const confirmPassword = clean(req.body.confirmPassword);

    if (!studentName || !email || !phone || !course || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill name, email, WhatsApp number, course, password and confirm password.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (phone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit WhatsApp number.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password must match.",
      });
    }

    const existing = await Registration.findOne({
      email,
      phone,
      course,
      enrollmentStatus: { $ne: "Cancelled" },
    }).select("+password");

    if (existing) {
      if (!existing.password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        existing.password = hashedPassword;
        await existing.save();
        await Registration.updateMany(
          { email, phone, $or: [{ password: { $exists: false } }, { password: "" }] },
          { $set: { password: hashedPassword } }
        );

        const legacyRegistrations = await Registration.find({ email, phone })
          .sort({ createdAt: -1 })
          .select(SAFE_REGISTRATION_FIELDS);

        return res.json({
          success: true,
          message: "Password added to your existing registration.",
          registrationId: existing.registrationId,
          registration: normalizeRegistration(existing),
          ...authResponse(existing, legacyRegistrations),
        });
      }

      return res.status(409).json({
        success: false,
        message: "You are already registered for this course. Please login to view your details.",
        registrationId: existing.registrationId,
        registration: normalizeRegistration(existing),
      });
    }

    const registrationId = await generateRegistrationId();
    const hashedPassword = await bcrypt.hash(password, 12);

    const registration = await Registration.create({
      registrationId,
      studentName,
      email,
      phone,
      password: hashedPassword,
      collegeName,
      course,
      plan,
      amount: 599,
      enrollmentStatus: "Registered",
    });
    await Registration.updateMany(
      { email, phone, $or: [{ password: { $exists: false } }, { password: "" }] },
      { $set: { password: hashedPassword } }
    );

    return res.status(201).json({
      success: true,
      message: "Registration completed successfully.",
      registrationId,
      registration: normalizeRegistration(registration),
      ...authResponse(registration),
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete registration.",
      error: error.message,
    });
  }
}

async function loginStudent(req, res) {
  try {
    const email = clean(req.body.email).toLowerCase();
    const password = clean(req.body.password);

    if (!email || !password) {
      await LoginLog.create({
        email: email || "missing",
        phone: "not-used",
        status: "failed",
        message: "Missing email or password",
      });

      return res.status(400).json({
        success: false,
        message: "Please enter registered email and password.",
      });
    }

    const registrationsWithPassword = await Registration.find({ email })
      .sort({ createdAt: -1 })
      .select(`+password ${SAFE_REGISTRATION_FIELDS}`);

    if (!registrationsWithPassword.length) {
      await LoginLog.create({
        email,
        phone: "not-found",
        status: "failed",
        message: "No registration found",
      });

      return res.status(404).json({
        success: false,
        message: "No registration found with this email.",
      });
    }

    const authenticatedRegistration =
      registrationsWithPassword.findLast((registration) => registration.password)
      || registrationsWithPassword[registrationsWithPassword.length - 1];

    if (!authenticatedRegistration.password) {
      await LoginLog.create({
        email,
        phone: authenticatedRegistration.phone,
        status: "failed",
        message: "Password not set",
      });

      return res.status(401).json({
        success: false,
        message: "Password is not set for this account. Please register again with a password.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, authenticatedRegistration.password);

    if (!passwordMatches) {
      await LoginLog.create({
        email,
        phone: authenticatedRegistration.phone,
        status: "failed",
        message: "Wrong password",
      });

      return res.status(401).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    const registrations = await Registration.find({ email })
      .sort({ createdAt: -1 })
      .select(SAFE_REGISTRATION_FIELDS);

    await LoginLog.create({
      email,
      phone: authenticatedRegistration.phone,
      studentName: authenticatedRegistration.studentName,
      registrationIds: registrations.map((item) => item.registrationId),
      status: "success",
      message: "Student login successful",
    });

    return res.json({
      success: true,
      ...authResponse(authenticatedRegistration, registrations),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login right now.",
    });
  }
}

router.post("/", registerStudent);
router.post("/register", registerStudent);
router.post("/login", loginStudent);

router.get("/me", async (req, res) => {
  try {
    const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token || !process.env.JWT_SECRET) {
      return res.status(401).json({ success: false, message: "Please login to continue." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const registration = await Registration.findById(payload.userId).select(SAFE_REGISTRATION_FIELDS);
    if (!registration) {
      return res.status(401).json({ success: false, message: "Your login is no longer valid." });
    }

    return res.json({
      success: true,
      user: {
        id: String(registration._id),
        name: registration.studentName,
        email: registration.email,
        mobile: registration.phone,
      },
      studentName: registration.studentName,
      email: registration.email,
      phone: registration.phone,
    });
  } catch (_error) {
    return res.status(401).json({ success: false, message: "Please login again." });
  }
});

router.get("/verify/:registrationId", async (req, res) => {
  try {
    const registrationId = clean(req.params.registrationId).toUpperCase();

    const registration = await Registration.findOne({ registrationId }).select(
      "registrationId studentName email phone collegeName course plan amount enrollmentStatus createdAt"
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: "Registration ID not found.",
      });
    }

    return res.json({
      success: true,
      verified: true,
      valid: true,
      registration,
    });
  } catch (error) {
    console.error("Verify error:", error);

    return res.status(500).json({
      success: false,
      verified: false,
      message: "Unable to verify registration.",
    });
  }
});

module.exports = router;
