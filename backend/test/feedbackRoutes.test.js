const assert = require("node:assert/strict");
const test = require("node:test");

let savedFeedback = null;
const feedbackModule = require.resolve("../models/Feedback");
require.cache[feedbackModule] = {
  id: feedbackModule,
  filename: feedbackModule,
  loaded: true,
  exports: {
    async findOne() { return savedFeedback; },
    async findOneAndUpdate(_query, update) {
      savedFeedback = { ...update.$set, updatedAt: new Date() };
      return savedFeedback;
    },
  },
};

const router = require("../routes/feedbackRoutes");

function routeHandler(path, method) {
  const layer = router.stack.find((item) => item.route?.path === path && item.route.methods[method]);
  return layer.route.stack.at(-1).handle;
}

async function call(path, method, body = {}) {
  const response = { statusCode: 200, body: null };
  const res = {
    status(code) { response.statusCode = code; return this; },
    json(payload) { response.body = payload; return this; },
  };
  await routeHandler(path, method)({
    body,
    user: { userId: "user-id", studentName: "Student Name", email: "student@example.com" },
  }, res);
  return response;
}

test.beforeEach(() => { savedFeedback = null; });

test("feedback rejects missing or invalid ratings", async () => {
  const response = await call("/", "post", { course: "Python Programming", ratings: { overall: 5 } });
  assert.equal(response.statusCode, 400);
  assert.equal(savedFeedback, null);
});

test("feedback saves authenticated student ratings and calculates the average", async () => {
  const response = await call("/", "post", {
    course: "Python Programming",
    ratings: { overall: 5, explanation: 4, content: 5, platform: 4 },
    recommendation: "yes",
    likedMost: "Clear explanations",
    suggestions: "More practice questions",
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.feedback.averageRating, 4.5);
  assert.equal(savedFeedback.studentEmail, "student@example.com");
});

test("feedback returns the current student's saved response", async () => {
  savedFeedback = { course: "Python Programming", averageRating: 5, ratings: {}, updatedAt: new Date() };
  const response = await call("/me", "get");
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.feedback.course, "Python Programming");
});
