const assert = require("node:assert/strict");
const test = require("node:test");

const mentorshipModule = require.resolve("../models/MentorshipBooking");
const paymentModule = require.resolve("../models/Payment");

let mentorshipDuplicate = false;
let courseDuplicate = false;
let createdBooking = null;

require.cache[mentorshipModule] = {
  id: mentorshipModule,
  filename: mentorshipModule,
  loaded: true,
  exports: {
    async exists() { return mentorshipDuplicate; },
    async create(data) {
      createdBooking = { _id: "booking-id", status: "PENDING", ...data };
      return createdBooking;
    },
    find() {},
  },
};

require.cache[paymentModule] = {
  id: paymentModule,
  filename: paymentModule,
  loaded: true,
  exports: { async exists() { return courseDuplicate; } },
};

const router = require("../routes/mentorshipRoutes");
const route = router.stack.find((layer) => layer.route?.path === "/bookings" && layer.route.methods.post);
const submitBooking = route.route.stack.at(-1).handle;

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
    user: { userId: "student-id", email: "student@example.com" },
    mongoUser: { studentName: "Student", email: "student@example.com", phone: "9876543210" },
  };
}

test.beforeEach(() => {
  mentorshipDuplicate = false;
  courseDuplicate = false;
  createdBooking = null;
});

test("mentorship QR request requires and stores a valid 12-digit UTR", async () => {
  const { result, res } = responseRecorder();
  await submitBooking(request({ topic: "Placement", transactionId: "123456789012" }), res);

  assert.equal(result.statusCode, 201);
  assert.equal(createdBooking.transactionId, "123456789012");
  assert.equal(createdBooking.status, "PENDING");
});

test("mentorship QR request rejects missing or invalid UTR values", async () => {
  const missing = responseRecorder();
  await submitBooking(request({ topic: "Placement" }), missing.res);
  assert.equal(missing.result.statusCode, 400);

  const invalid = responseRecorder();
  await submitBooking(request({ topic: "Placement", transactionId: "12345" }), invalid.res);
  assert.equal(invalid.result.statusCode, 400);
  assert.equal(createdBooking, null);
});

test("mentorship QR request rejects a UTR already used in either payment flow", async () => {
  courseDuplicate = true;
  const { result, res } = responseRecorder();
  await submitBooking(request({ topic: "Placement", transactionId: "123456789012" }), res);

  assert.equal(result.statusCode, 409);
  assert.equal(createdBooking, null);
});
