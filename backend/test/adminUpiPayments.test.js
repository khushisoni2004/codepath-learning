const assert = require("node:assert/strict");
const test = require("node:test");

const mongooseModule = require.resolve("mongoose");
const paymentModule = require.resolve("../models/Payment");
const enrollmentModule = require.resolve("../models/Enrollment");
const counterModule = require.resolve("../models/Counter");
const registrationModule = require.resolve("../models/Registration");

let payment;
let enrollmentCreated;

require.cache[mongooseModule] = {
  id: mongooseModule,
  filename: mongooseModule,
  loaded: true,
  exports: {
    isValidObjectId(value) { return value === "507f1f77bcf86cd799439011"; },
    connection: { async transaction(callback) { await callback("session"); } },
  },
};
require.cache[paymentModule] = {
  id: paymentModule,
  filename: paymentModule,
  loaded: true,
  exports: {
    findOne() { return { session: async () => payment }; },
    find() { return { select: () => ({ sort: async () => [] }) }; },
  },
};
require.cache[enrollmentModule] = {
  id: enrollmentModule,
  filename: enrollmentModule,
  loaded: true,
  exports: { async findOneAndUpdate(query, update) { enrollmentCreated = { query, update }; } },
};
require.cache[counterModule] = {
  id: counterModule,
  filename: counterModule,
  loaded: true,
  exports: { async findOneAndUpdate() { return { value: 7 }; } },
};
require.cache[registrationModule] = {
  id: registrationModule,
  filename: registrationModule,
  loaded: true,
  exports: { find() {}, findOneAndUpdate() {} },
};

const router = require("../routes/adminRoutes");
const route = router.stack.find((layer) => layer.route?.path === "/upi-payments/:paymentId" && layer.route.methods.patch);
const approveHandler = route.route.stack.at(-1).handle;

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

test.beforeEach(() => {
  enrollmentCreated = null;
  payment = {
    _id: "payment-id",
    userId: "student-id",
    courseSlug: "python",
    courseTitle: "Python Programming",
    paymentMethod: "UPI_QR",
    utrNumber: "123456789012",
    status: "PENDING",
    async save() {},
  };
});

test("admin approval atomically marks QR payment paid, creates receipt, and unlocks enrollment", async () => {
  const { result, res } = responseRecorder();
  await approveHandler({
    params: { paymentId: "507f1f77bcf86cd799439011" },
    body: { action: "approve" },
  }, res);

  assert.equal(result.statusCode, 200);
  assert.equal(payment.status, "PAID");
  assert.equal(payment.receiptNumber, "CPL-RCPT-2026-000007");
  assert.ok(payment.paidAt instanceof Date);
  assert.equal(enrollmentCreated.query.courseSlug, "python");
  assert.equal(enrollmentCreated.update.$setOnInsert.status, "ACTIVE");
});

test("admin rejection keeps the course locked and generates no receipt", async () => {
  const { result, res } = responseRecorder();
  await approveHandler({
    params: { paymentId: "507f1f77bcf86cd799439011" },
    body: { action: "reject" },
  }, res);

  assert.equal(result.statusCode, 200);
  assert.equal(payment.status, "FAILED");
  assert.equal(payment.receiptNumber, undefined);
  assert.equal(enrollmentCreated, null);
});

test("admin cannot approve a QR request without a valid UTR", async () => {
  payment.utrNumber = undefined;
  const { result, res } = responseRecorder();
  await approveHandler({
    params: { paymentId: "507f1f77bcf86cd799439011" },
    body: { action: "approve" },
  }, res);

  assert.equal(result.statusCode, 400);
  assert.equal(payment.status, "PENDING");
  assert.equal(payment.receiptNumber, undefined);
  assert.equal(enrollmentCreated, null);
});
