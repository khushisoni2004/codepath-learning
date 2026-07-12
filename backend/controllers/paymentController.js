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

function paymentConfig() {
  const coursePrice = Number(process.env.COURSE_PRICE);
  const amount = coursePrice * 100;
  const currency = process.env.RAZORPAY_CURRENCY;
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || coursePrice !== 599 || currency !== "INR") {
    throw new Error("Payment environment must configure COURSE_PRICE=599 and RAZORPAY_CURRENCY=INR.");
  }
  return { amount, currency };
}

function receiptView(payment) {
  return {
    receiptNumber: payment.receiptNumber,
    paymentId: payment.razorpayPaymentId,
    orderId: payment.razorpayOrderId,
    courseTitle: payment.courseTitle,
    amount: payment.amount,
    studentName: payment.studentName,
    studentEmail: payment.studentEmail,
    paidAt: payment.paidAt,
  };
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

    const { amount, currency } = paymentConfig();
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
      currency: order.currency, status: "PENDING", razorpayOrderId: order.id,
      studentName: req.user.studentName, studentEmail: req.user.email,
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

exports.getReceipt = async (req, res) => {
  try {
    const payment = await Payment.findOne({ razorpayPaymentId: req.params.paymentId, userId: req.user._id, status: "PAID" });
    if (!payment) return res.status(404).json({ success: false, message: "Receipt not found." });
    return res.json({ success: true, receipt: receiptView(payment) });
  } catch (error) {
    console.error("Load receipt error:", error);
    return res.status(500).json({ success: false, message: "Unable to load receipt." });
  }
};
