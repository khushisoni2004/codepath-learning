const assert = require("node:assert/strict");
const test = require("node:test");

process.env.COURSE_PRICE = "599";
process.env.RAZORPAY_CURRENCY = "INR";

let pendingPayment = null;
let latestPayment = null;
let createdPayment = null;
let enrollmentExists = false;

function queryResult(value) {
  return {
    then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); },
    sort() { return Promise.resolve(value); },
  };
}

const paymentModule = require.resolve("../models/Payment");
const enrollmentModule = require.resolve("../models/Enrollment");
require.cache[paymentModule] = {
  id: paymentModule,
  filename: paymentModule,
  loaded: true,
  exports: {
    findOne(query) {
      if (query.status === "PENDING") return queryResult(pendingPayment);
      return queryResult(latestPayment);
    },
    async create(data) {
      createdPayment = { _id: "payment-id", createdAt: new Date(), ...data };
      return createdPayment;
    },
  },
};
require.cache[enrollmentModule] = {
  id: enrollmentModule,
  filename: enrollmentModule,
  loaded: true,
  exports: {
    async exists() { return enrollmentExists; },
    async findOneAndUpdate() { throw new Error("Pending UPI submission must not create enrollment"); },
  },
};

const { submitManualPayment, getManualPaymentStatus } = require("../controllers/paymentController");

function responseRecorder() {
  const result = { statusCode: 200, body: null };
  return {
    result,
    res: {
      status(code) { result.statusCode = code; return this; },
      json(body) { result.body = body; return this; },
    },
  };
}

function request(body = {}) {
  return {
    body,
    params: { courseSlug: "python" },
    user: { _id: "student-id", studentName: "Student", email: "student@example.com", phone: "9876543210" },
  };
}

test.beforeEach(() => {
  pendingPayment = null;
  latestPayment = null;
  createdPayment = null;
  enrollmentExists = false;
});

test("QR submission requires and stores a valid 12-digit UTR", async () => {
  const { result, res } = responseRecorder();
  await submitManualPayment(request({ courseSlug: "python", utrNumber: "123456789012" }), res);
  assert.equal(result.statusCode, 201);
  assert.equal(createdPayment.paymentMethod, "UPI_QR");
  assert.equal(createdPayment.status, "PENDING");
  assert.equal(createdPayment.utrNumber, "123456789012");
  assert.equal(createdPayment.payerUpiId, undefined);
  assert.equal(createdPayment.studentEmail, "student@example.com");
  assert.equal(result.body.payment.receipt, null);
});

test("QR submission stores a pending payment but does not unlock the course or create a receipt", async () => {
  const { result, res } = responseRecorder();
  await submitManualPayment(request({ courseSlug: "python", utrNumber: "123456789012" }), res);
  assert.equal(result.statusCode, 201);
  assert.equal(createdPayment.paymentMethod, "UPI_QR");
  assert.equal(createdPayment.status, "PENDING");
  assert.equal(createdPayment.utrNumber, "123456789012");
  assert.equal(createdPayment.payerUpiId, undefined);
  assert.equal(createdPayment.receiptNumber, undefined);
  assert.equal(result.body.payment.receipt, null);
});

test("a second request is rejected while verification is pending", async () => {
  pendingPayment = { userId: "student-id", courseSlug: "python", status: "PENDING" };
  const { result, res } = responseRecorder();
  await submitManualPayment(request({ courseSlug: "python", utrNumber: "123456789012" }), res);
  assert.equal(result.statusCode, 409);
  assert.match(result.body.message, /pending verification/i);
});

test("QR submission rejects missing or invalid UTR values", async () => {
  const missing = responseRecorder();
  await submitManualPayment(request({ courseSlug: "python" }), missing.res);
  assert.equal(missing.result.statusCode, 400);

  const invalid = responseRecorder();
  await submitManualPayment(request({ courseSlug: "python", utrNumber: "12345" }), invalid.res);
  assert.equal(invalid.result.statusCode, 400);
  assert.equal(createdPayment, null);
});

test("manual status exposes a receipt only after the payment is paid", async () => {
  latestPayment = {
    _id: "payment-id",
    userId: "student-id",
    courseSlug: "python",
    courseTitle: "Python Programming",
    amount: 59900,
    currency: "INR",
    paymentMethod: "UPI_QR",
    utrNumber: "UTR123456",
    status: "PAID",
    receiptNumber: "CPL-RCPT-2026-000001",
    paidAt: new Date(),
  };
  const { result, res } = responseRecorder();
  await getManualPaymentStatus(request(), res);
  assert.equal(result.statusCode, 200);
  assert.equal(result.body.payment.receipt.paymentMethod, "UPI_QR");
  assert.equal(result.body.payment.receipt.paymentId, "UTR123456");
});
