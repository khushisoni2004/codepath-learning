const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const test = require("node:test");
const bcrypt = require("bcrypt");

process.env.JWT_SECRET = "test-only-secret-with-at-least-thirty-two-characters";
process.env.FRONTEND_URL = "https://learn.example.com";

const userModule = require.resolve("../models/User");
const registrationModule = require.resolve("../models/Registration");
const mailModule = require.resolve("../utils/sendPasswordResetEmail");

let emailUser = null;
let resetUser = null;
let resetUpdateResult = null;
let resetUpdate = null;
let sentMail = null;
let accountExists = false;
let createdAccount = null;
let legacyRegistration = null;

const User = {
  findOne(query) {
    const result = query.email ? emailUser : resetUser;
    return { select: async () => result };
  },
  async updateOne() {},
  async exists() { return accountExists; },
  async create(details) {
    createdAccount = details;
    return { _id: "new-user", sessionVersion: 0, ...details };
  },
  findOneAndUpdate(_query, update) {
    resetUpdate = update;
    const result = resetUpdateResult;
    resetUser = null;
    resetUpdateResult = null;
    return Promise.resolve(result);
  },
};

const Registration = {
  find() {
    return { sort: () => ({ select: async () => [] }) };
  },
  findOne() {
    return { sort: () => ({ select: async () => legacyRegistration }) };
  },
};

require.cache[userModule] = { id: userModule, filename: userModule, loaded: true, exports: User };
require.cache[registrationModule] = { id: registrationModule, filename: registrationModule, loaded: true, exports: Registration };
require.cache[mailModule] = {
  id: mailModule,
  filename: mailModule,
  loaded: true,
  exports: async (email, url) => { sentMail = { email, url }; },
};

const router = require("../routes/authRoutes");

function handler(path) {
  return router.stack.find((layer) => layer.route?.path === path).route.stack[0].handle;
}

async function call(path, body) {
  const response = { statusCode: 200, body: null };
  const res = {
    status(code) { response.statusCode = code; return this; },
    json(payload) { response.body = payload; return this; },
  };
  await handler(path)({ body }, res);
  return response;
}

test.beforeEach(() => {
  emailUser = null;
  resetUser = null;
  resetUpdateResult = null;
  resetUpdate = null;
  sentMail = null;
  accountExists = false;
  createdAccount = null;
  legacyRegistration = null;
});

test("registration stores a bcrypt hash and returns a backend session", async () => {
  const response = await call("/register", {
    name: "Student Name",
    email: "student@example.com",
    mobile: "9876543210",
    password: "secure-password",
  });

  assert.equal(response.statusCode, 201);
  assert.equal(typeof response.body.token, "string");
  assert.equal(createdAccount.password, undefined);
  assert.equal(await bcrypt.compare("secure-password", createdAccount.passwordHash), true);
});

test("login verifies the backend bcrypt hash and rejects a wrong password", async () => {
  emailUser = {
    _id: "backend-user",
    name: "Student Name",
    email: "student@example.com",
    mobile: "9876543210",
    sessionVersion: 0,
    passwordHash: await bcrypt.hash("correct-password", 12),
  };

  const valid = await call("/login", { email: emailUser.email, password: "correct-password" });
  const invalid = await call("/login", { email: emailUser.email, password: "wrong-password" });
  assert.equal(valid.statusCode, 200);
  assert.equal(typeof valid.body.token, "string");
  assert.equal(invalid.statusCode, 401);
  assert.equal(invalid.body.message, "Incorrect email or password.");
});

test("existing registration passwords migrate without changing the password", async () => {
  legacyRegistration = {
    _id: "legacy-registration",
    studentName: "Existing Student",
    email: "existing@example.com",
    phone: "9876543210",
    password: await bcrypt.hash("existing-password", 12),
  };

  const response = await call("/login", { email: legacyRegistration.email, password: "existing-password" });
  assert.equal(response.statusCode, 200);
  assert.equal(createdAccount.legacyRegistrationId, "legacy-registration");
  assert.equal(createdAccount.passwordHash, legacyRegistration.password);
});

test("forgot password stores only a SHA-256 hash with a 15-minute expiry", async () => {
  let savedHash;
  let savedExpiry;
  emailUser = {
    _id: "mongo-user",
    email: "student@example.com",
    async save() {
      savedHash = this.passwordResetTokenHash;
      savedExpiry = this.passwordResetExpiresAt;
    },
  };

  const before = Date.now();
  const response = await call("/forgot-password", { email: "student@example.com" });
  const rawToken = new URL(sentMail.url).searchParams.get("token");

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.message, "If an account exists with this email, a reset link has been sent.");
  assert.notEqual(savedHash, rawToken);
  assert.equal(savedHash, crypto.createHash("sha256").update(rawToken).digest("hex"));
  assert.ok(savedExpiry.getTime() >= before + (15 * 60 * 1000));
  assert.ok(savedExpiry.getTime() <= Date.now() + (15 * 60 * 1000));
});

test("forgot password does not reveal an unknown email", async () => {
  const response = await call("/forgot-password", { email: "unknown@example.com" });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.message, "If an account exists with this email, a reset link has been sent.");
  assert.equal(sentMail, null);
});

test("reset password rejects invalid or expired tokens generically", async () => {
  const response = await call("/reset-password", {
    token: "invalid-token",
    password: "new-password",
    confirmPassword: "new-password",
  });
  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /invalid or expired/i);
  assert.equal(resetUpdate, null);
});

test("reset password validates password length and confirmation", async () => {
  const short = await call("/reset-password", { token: "token", password: "short", confirmPassword: "short" });
  const mismatch = await call("/reset-password", { token: "token", password: "new-password", confirmPassword: "different-password" });
  assert.equal(short.statusCode, 400);
  assert.equal(mismatch.statusCode, 400);
  assert.equal(resetUpdate, null);
});

test("reset password stores bcrypt only, invalidates sessions, and prevents replay", async () => {
  resetUser = { _id: "backend-user" };
  resetUpdateResult = { _id: "backend-user" };
  const body = { token: "valid-token", password: "new-password", confirmPassword: "new-password" };
  const first = await call("/reset-password", body);
  const replay = await call("/reset-password", body);

  assert.equal(first.statusCode, 200);
  assert.equal(await bcrypt.compare("new-password", resetUpdate.$set.passwordHash), true);
  assert.equal(resetUpdate.$inc.sessionVersion, 1);
  assert.deepEqual(resetUpdate.$unset, { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 });
  assert.equal(replay.statusCode, 400);
});
