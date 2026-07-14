const jwt = require("jsonwebtoken");

function getSecret() {
  const secret = String(process.env.JWT_SECRET || "");
  if (secret.length < 32) throw new Error("JWT_SECRET must be at least 32 characters.");
  return secret;
}

function signAuthToken(user) {
  return jwt.sign(
    { sessionVersion: user.sessionVersion || 0 },
    getSecret(),
    { subject: String(user._id), expiresIn: "7d", issuer: "codepath-learning-api", audience: "codepath-learning-web" }
  );
}

function verifyAuthToken(token) {
  return jwt.verify(token, getSecret(), {
    issuer: "codepath-learning-api",
    audience: "codepath-learning-web",
  });
}

module.exports = { signAuthToken, verifyAuthToken };
