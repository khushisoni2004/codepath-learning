const assert = require("node:assert/strict");
const test = require("node:test");

process.env.WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/paid-students";
process.env.GOOGLE_CLASSROOM_URL = "https://classroom.google.com/c/paid-students";
process.env.ENROLLMENT_FORM_URL = "https://docs.google.com/forms/d/paid-students/viewform";

let hasPaidCourse = false;
const enrollmentModule = require.resolve("../models/Enrollment");
require.cache[enrollmentModule] = {
  id: enrollmentModule,
  filename: enrollmentModule,
  loaded: true,
  exports: { async exists() { return hasPaidCourse; } },
};

const { getStudentResource } = require("../controllers/paymentController");

async function call(resource) {
  const response = { statusCode: 200, body: null };
  const res = {
    status(code) { response.statusCode = code; return this; },
    json(payload) { response.body = payload; return this; },
  };
  await getStudentResource({ params: { resource }, user: { _id: "student-id" } }, res);
  return response;
}

test.beforeEach(() => { hasPaidCourse = false; });

test("student resources reject logged-in users without a paid course", async () => {
  const response = await call("whatsapp");
  assert.equal(response.statusCode, 403);
  assert.equal(response.body.success, false);
  assert.equal(response.body.url, undefined);
});

test("student resources return the requested link to a paid student", async () => {
  hasPaidCourse = true;
  const response = await call("classroom");
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.url, process.env.GOOGLE_CLASSROOM_URL);
});

test("student resources reject unknown resource names", async () => {
  hasPaidCourse = true;
  const response = await call("unknown");
  assert.equal(response.statusCode, 404);
  assert.equal(response.body.url, undefined);
});
