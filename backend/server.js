const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const registrationRoutes = require("./routes/registrationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const PORT = process.env.PORT || 5001;
const MONGODB_DATABASE_NAME = process.env.MONGODB_DATABASE_NAME || "codepath_learning";
const MONGODB_URI = buildMongoUri(
  process.env.MONGODB_URI
    || process.env.MONGO_URI
    || process.env.MONGODB_URL
    || process.env.DATABASE_URL
);
const MONGODB_CONNECT_TIMEOUT_MS = 30000;
const MONGODB_RETRY_DELAY_MS = 10000;
let lastMongoError = "";
const requiredEnvironment = [
  "MONGODB_URI",
  "JWT_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "COURSE_PRICE",
  "RAZORPAY_CURRENCY",
  "FRONTEND_URL",
];
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);

if (missingEnvironment.length) {
  console.warn(`Missing environment variables: ${missingEnvironment.join(", ")}`);
}
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://www.codepathlearning.co.in",
  "https://codepathlearning.co.in",
  "https://codepath-learning.vercel.app",
].filter(Boolean);

function buildMongoUri(uri) {
  if (!uri) return "";

  try {
    const parsed = new URL(uri);
    if (parsed.protocol === "mongodb+srv:" || parsed.protocol === "mongodb:") {
      const databasePath = parsed.pathname.replace(/^\/+/, "");
      if (!databasePath) parsed.pathname = `/${MONGODB_DATABASE_NAME}`;
    }

    return parsed.toString();
  } catch (_error) {
    return uri;
  }
}

function mongoConnectionInfo(uri) {
  try {
    const parsed = new URL(uri);
    return {
      host: parsed.host,
      database: parsed.pathname.replace(/^\/+/, "") || MONGODB_DATABASE_NAME,
      configured: true,
    };
  } catch (_error) {
    return {
      host: "unknown",
      database: MONGODB_DATABASE_NAME,
      configured: Boolean(uri),
    };
  }
}

function safeMongoError(message) {
  const text = String(message || "");
  if (!text) return "";
  if (/bad auth|authentication failed|auth failed/i.test(text)) {
    return "MongoDB authentication failed. Check username and password in Render MONGODB_URI.";
  }
  if (/IP|whitelist|not authorized|not allowed/i.test(text)) {
    return "MongoDB network access blocked. Allow Render outbound IP or 0.0.0.0/0 in Atlas Network Access.";
  }
  if (/ETIMEOUT|timed out|ENOTFOUND|ECONNREFUSED|querySrv/i.test(text)) {
    return "MongoDB network/DNS timeout. Check Atlas Network Access and Render connectivity.";
  }
  return text.replace(/mongodb(\+srv)?:\/\/[^@\s]+@/gi, "mongodb$1://<credentials>@").slice(0, 220);
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS."));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CodePath Learning API is running",
  });
});

app.get("/api/health", (req, res) => {
  const mongoInfo = mongoConnectionInfo(MONGODB_URI);
  res.json({
    success: true,
    message: "CodePath Learning backend running",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    mongoConfigured: mongoInfo.configured,
    mongoHost: mongoInfo.host,
    mongoDatabase: mongoInfo.database,
    mongoError: mongoose.connection.readyState === 1 ? "" : lastMongoError,
  });
});

app.use("/api", (req, res, next) => {
  if (req.path === "/health" || mongoose.connection.readyState === 1) return next();

  return res.status(503).json({
    success: false,
    message: "Database is not connected yet. Please try again shortly.",
  });
});

app.use("/api/registrations", registrationRoutes);
app.use("/api/auth", registrationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.use((error, _req, res, _next) => {
  console.error(`Request failed: ${error.message}`);
  return res.status(error.message === "Origin is not allowed by CORS." ? 403 : 500).json({
    success: false,
    message: error.message === "Origin is not allowed by CORS."
      ? error.message
      : "Backend request failed.",
  });
});

async function startServer() {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CodePath Learning backend listening on port ${PORT}`);
  });

  startDatabase();
}

function startDatabase() {
  if (!MONGODB_URI) {
    console.error("MongoDB connection skipped: MONGODB_URI is required.");
    return;
  }

  const mongoInfo = mongoConnectionInfo(MONGODB_URI);
  console.log(`MongoDB configured for ${mongoInfo.host}/${mongoInfo.database}`);
  connectDatabase();
}

async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: MONGODB_CONNECT_TIMEOUT_MS,
      connectTimeoutMS: MONGODB_CONNECT_TIMEOUT_MS,
    });

    lastMongoError = "";
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  } catch (error) {
    lastMongoError = safeMongoError(error.message);
    console.error(`MongoDB connection failed: ${lastMongoError}`);
    setTimeout(connectDatabase, MONGODB_RETRY_DELAY_MS);
  }
}

if (process.env.VERCEL) {
  startDatabase();
} else {
  startServer();
}

module.exports = app;
