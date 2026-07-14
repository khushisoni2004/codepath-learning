const nodemailer = require("nodemailer");

function required(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) throw new Error(`${name} is required to send password reset emails.`);
  return value;
}

function getTransport() {
  const port = Number(process.env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid port number.");
  }

  return nodemailer.createTransport({
    host: required("SMTP_HOST"),
    port,
    secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465,
    auth: {
      user: required("SMTP_USER"),
      pass: required("SMTP_PASS"),
    },
  });
}

async function sendPasswordResetEmail(email, resetUrl) {
  const from = required("EMAIL_FROM");
  await getTransport().sendMail({
    from,
    to: email,
    subject: "Reset your CodePath Learning password",
    text: `Use this link to reset your CodePath Learning password. It expires in 15 minutes and can only be used once:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>Use the link below to reset your CodePath Learning password.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 15 minutes and can only be used once.</p><p>If you did not request this, you can ignore this email.</p>`,
  });
}

module.exports = sendPasswordResetEmail;
