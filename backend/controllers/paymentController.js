const crypto = require("crypto");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const Counter = require("../models/Counter");
const Enrollment = require("../models/Enrollment");
const Payment = require("../models/Payment");

const COURSES = {
  "web-development": "Web Development",
  python: "Python Programming",
  "c-programming": "C Programming",
  mysql: "MySQL Database",
  "vibe-coding-ai": "Vibe Coding with AI",
  "ai-tools-projects": "AI Tools for Smart Projects",
};

const STUDENT_RESOURCE_ENV = Object.freeze({
  whatsapp: "WHATSAPP_GROUP_URL",
  classroom: "GOOGLE_CLASSROOM_URL",
  enrollment: "ENROLLMENT_FORM_URL",
});

function priceConfig() {
  const coursePrice = Number(process.env.COURSE_PRICE);
  const amount = coursePrice * 100;
  const currency = process.env.RAZORPAY_CURRENCY;
  if (coursePrice !== 599 || currency !== "INR") {
    throw new Error("Payment environment must configure COURSE_PRICE=599 and RAZORPAY_CURRENCY=INR.");
  }
  return { amount, currency };
}

function razorpayConfig() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials are not configured.");
  }
  return priceConfig();
}

function receiptView(payment) {
  return {
    receiptNumber: payment.receiptNumber,
    paymentId: payment.razorpayPaymentId || payment.utrNumber || String(payment._id),
    orderId: payment.razorpayOrderId || null,
    paymentMethod: payment.paymentMethod || "RAZORPAY",
    courseTitle: payment.courseTitle,
    amount: payment.amount,
    studentName: payment.studentName,
    studentEmail: payment.studentEmail,
    paidAt: payment.paidAt,
  };
}

function manualPaymentView(payment) {
  if (!payment) return null;
  return {
    id: payment._id,
    courseSlug: payment.courseSlug,
    courseTitle: payment.courseTitle,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    utrNumber: payment.utrNumber,
    payerUpiId: payment.payerUpiId,
    submittedAt: payment.createdAt,
    receipt: payment.status === "PAID" ? receiptView(payment) : null,
  };
}

function normalizedUtr(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
}

function normalizedUpiId(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "");
}

exports.createOrder = async (req, res) => {
  try {
    const courseSlug = String(req.body.courseSlug || "").trim().toLowerCase();
    const courseTitle = COURSES[courseSlug];
    if (!courseTitle) return res.status(400).json({ success: false, message: "Invalid course." });

    const paid = await Enrollment.exists({ userId: req.user._id, courseSlug, status: "ACTIVE" });
    if (paid) return res.json({ success: true, alreadyPaid: true });

    const verifiedPayment = await Payment.findOne({ userId: req.user._id, courseSlug, status: "PAID" });
    if (verifiedPayment) {
      await Enrollment.findOneAndUpdate(
        { userId: req.user._id, courseSlug },
        { $setOnInsert: { courseTitle: verifiedPayment.courseTitle, paymentId: verifiedPayment._id, enrolledAt: verifiedPayment.paidAt, status: "ACTIVE" } },
        { upsert: true }
      );
      return res.json({ success: true, alreadyPaid: true });
    }

    const { amount, currency } = razorpayConfig();
    const receiptCourse = courseSlug.replace(/[^a-z0-9]/g, "").slice(0, 8);
    const receiptUser = String(req.user._id).slice(-6);
    const receipt = `CPL_${receiptCourse}_${receiptUser}_${Date.now()}`;
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
      notes: {
        userId: String(req.user._id), userName: req.user.studentName,
        userEmail: req.user.email, courseSlug, courseTitle, plan: "Certificate Plan",
      },
    });

    await Payment.create({
      userId: req.user._id, courseSlug, courseTitle, amount: order.amount,
      currency: order.currency, paymentMethod: "RAZORPAY", status: "PENDING", razorpayOrderId: order.id,
      studentName: req.user.studentName, studentEmail: req.user.email, studentPhone: req.user.phone,
    });
    return res.status(201).json({
      success: true, keyId: process.env.RAZORPAY_KEY_ID, orderId: order.id,
      amount: order.amount, currency: order.currency, course: { slug: courseSlug, title: courseTitle },
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);
    return res.status(500).json({ success: false, message: "Unable to start payment." });
  }
};

exports.submitManualPayment = async (req, res) => {
  const courseSlug = String(req.body?.courseSlug || "").trim().toLowerCase();
  const courseTitle = COURSES[courseSlug];
  const utrNumber = normalizedUtr(req.body?.utrNumber);
  const payerUpiId = normalizedUpiId(req.body?.payerUpiId);
  const hasUpiId = payerUpiId.length > 0;

  if (!courseTitle) {
    return res.status(400).json({ success: false, message: "Invalid course." });
  }
  if (!/^\d{12}$/.test(utrNumber)) {
    return res.status(400).json({
      success: false,
      message: "Enter the valid 12-digit UPI reference number (UTR/RRN) shown after payment.",
    });
  }
  if (hasUpiId && !/^[a-z0-9._-]{2,100}@[a-z0-9.-]{2,64}$/.test(payerUpiId)) {
    return res.status(400).json({ success: false, message: "Enter a valid UPI ID, for example name@bank." });
  }

  try {
    const paid = await Enrollment.exists({ userId: req.user._id, courseSlug, status: "ACTIVE" });
    if (paid) return res.json({ success: true, alreadyPaid: true });

    const duplicate = await Payment.findOne({ utrNumber });
    if (duplicate) {
      if (String(duplicate.userId) === String(req.user._id) && duplicate.courseSlug === courseSlug) {
        return res.json({ success: true, payment: manualPaymentView(duplicate) });
      }
      return res.status(409).json({ success: false, message: "This UTR has already been submitted." });
    }

    const pending = await Payment.findOne({
      userId: req.user._id,
      courseSlug,
      paymentMethod: "UPI_QR",
      status: "PENDING",
    });
    if (pending) {
      return res.status(409).json({
        success: false,
        message: "A QR payment is already pending verification for this course.",
        payment: manualPaymentView(pending),
      });
    }

    const { amount, currency } = priceConfig();
    const payment = await Payment.create({
      userId: req.user._id,
      courseSlug,
      courseTitle,
      amount,
      currency,
      paymentMethod: "UPI_QR",
      status: "PENDING",
      utrNumber,
      payerUpiId: hasUpiId ? payerUpiId : undefined,
      studentName: req.user.studentName,
      studentEmail: req.user.email,
      studentPhone: req.user.phone,
    });

    return res.status(201).json({
      success: true,
      message: "Verification request submitted. Payment is not confirmed until the UTR and ₹599 bank credit are matched by admin.",
      payment: manualPaymentView(payment),
    });
  } catch (error) {
    console.error("Submit QR payment error:", error.message);
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "This UTR has already been submitted." });
    }
    return res.status(500).json({ success: false, message: "Unable to submit payment for verification." });
  }
};

exports.getManualPaymentStatus = async (req, res) => {
  try {
    const courseSlug = String(req.params.courseSlug || "").trim().toLowerCase();
    if (!COURSES[courseSlug]) return res.status(400).json({ success: false, message: "Invalid course." });

    const payment = await Payment.findOne({
      userId: req.user._id,
      courseSlug,
      paymentMethod: "UPI_QR",
    }).sort({ createdAt: -1 });

    if (!payment) return res.status(404).json({ success: false, message: "No QR payment submission found." });
    return res.json({ success: true, payment: manualPaymentView(payment) });
  } catch (error) {
    console.error("Load QR payment status error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to check payment status." });
  }
};

exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const courseSlug = String(req.body.courseSlug || "").trim().toLowerCase();
  try {
    if (!COURSES[courseSlug] || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Incomplete payment details." });
    }
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id, userId: req.user._id, courseSlug });
    if (!payment) return res.status(404).json({ success: false, message: "Payment order not found." });
    if (payment.status === "PAID") return res.json({ success: true, message: "Payment verified successfully", receipt: receiptView(payment) });

    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    const suppliedSignature = String(razorpay_signature);
    const valid = /^[a-f0-9]{64}$/i.test(suppliedSignature)
      && crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(suppliedSignature, "hex"));
    if (!valid) {
      payment.status = "FAILED";
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      await payment.save();
      return res.status(400).json({ success: false, message: "Payment signature verification failed." });
    }

    let verifiedPayment;
    await mongoose.connection.transaction(async (session) => {
      const current = await Payment.findOne({ _id: payment._id }).session(session);
      if (current.status === "PAID") {
        verifiedPayment = current;
        return;
      }

      const counter = await Counter.findOneAndUpdate(
        { name: "paymentReceipt" }, { $inc: { value: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true, session }
      );
      current.status = "PAID";
      current.razorpayPaymentId = razorpay_payment_id;
      current.razorpaySignature = razorpay_signature;
      current.receiptNumber = `CPL-RCPT-${new Date().getFullYear()}-${String(counter.value).padStart(6, "0")}`;
      current.paidAt = new Date();
      await current.save({ session });
      await Enrollment.findOneAndUpdate(
        { userId: req.user._id, courseSlug },
        { $setOnInsert: { courseTitle: current.courseTitle, paymentId: current._id, enrolledAt: current.paidAt, status: "ACTIVE" } },
        { upsert: true, new: true, session }
      );
      verifiedPayment = current;
    });
    return res.json({ success: true, message: "Payment verified successfully", receipt: receiptView(verifiedPayment) });
  } catch (error) {
    console.error("Verify Razorpay payment error:", error);
    return res.status(500).json({ success: false, message: "Unable to verify payment." });
  }
};

exports.myCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id, status: "ACTIVE" }).select("courseSlug -_id");
    return res.json({ success: true, paidCourses: enrollments.map((item) => item.courseSlug) });
  } catch (error) {
    console.error("Load paid courses error:", error);
    return res.status(500).json({ success: false, message: "Unable to load paid courses." });
  }
};

exports.getStudentResource = async (req, res) => {
  try {
    const resource = String(req.params.resource || "").trim().toLowerCase();
    const environmentName = STUDENT_RESOURCE_ENV[resource];
    if (!environmentName) {
      return res.status(404).json({ success: false, message: "Student resource not found." });
    }

    const paid = await Enrollment.exists({ userId: req.user._id, status: "ACTIVE" });
    if (!paid) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Purchase a course to access student resources.",
      });
    }

    const url = String(process.env[environmentName] || "").trim();
    if (!/^https:\/\//i.test(url)) {
      throw new Error(`${environmentName} must be configured as a secure HTTPS URL.`);
    }

    return res.json({ success: true, url });
  } catch (error) {
    console.error("Load student resource error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to open this student resource." });
  }
};

exports.getReceipt = async (req, res) => {
  try {
    const paymentId = String(req.params.paymentId || "").trim().toUpperCase();
    const payment = await Payment.findOne({
      userId: req.user._id,
      status: "PAID",
      $or: [{ razorpayPaymentId: req.params.paymentId }, { utrNumber: paymentId }],
    });
    if (!payment) return res.status(404).json({ success: false, message: "Receipt not found." });
    return res.json({ success: true, receipt: receiptView(payment) });
  } catch (error) {
    console.error("Load receipt error:", error);
    return res.status(500).json({ success: false, message: "Unable to load receipt." });
  }
};
