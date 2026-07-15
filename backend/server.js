const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const registrationRoutes = require("./routes/registrationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const mentorshipRoutes = require("./routes/mentorshipRoutes");
const Payment = require("./models/Payment");
const User = require("./models/User");

const app = express();

const PORT = process.env.PORT || 5001;
const MONGODB_DATABASE_NAME = process.env.MONGODB_DATABASE_NAME || "codepath_learning";
const MONGODB_URI = buildMongoUri(
  process.env.MONGODB_URI
    || process.env.MONGO_URI
    || process.env.MONGODB_URL
    || process.env.DATABASE_URL
);
const MONGODB_CONNECT_TIMEOUT_MS = 10000;
const MONGODB_RETRY_DELAY_MS = 5000;
let lastMongoError = "";
let mongoConnectPromise = null;
let authStoragePreparationPromise = null;

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
  } catch {
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
  } catch {
    return { host: "unknown", database: MONGODB_DATABASE_NAME, configured: Boolean(uri) };
  }
}

function safeMongoError(message) {
  const text = String(message || "");
  if (!text) return "";
  if (/bad auth|authentication failed|auth failed/i.test(text)) {
    return "MongoDB authentication failed. Check the deployed MONGODB_URI.";
  }
  if (/IP|whitelist|not authorized|not allowed/i.test(text)) {
    return "MongoDB network access is blocked. Check Atlas Network Access.";
  }
  if (/ETIMEOUT|timed out|ENOTFOUND|ECONNREFUSED|querySrv/i.test(text)) {
    return "MongoDB network/DNS timeout. Check Atlas connectivity.";
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
  allowedHeaders: ["Content-Type", "Authorization", "X-Admin-Key"],
}));

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ success: true, message: "CodePath Learning API is running" });
});

app.get("/api/health", async (_req, res) => {
  if (MONGODB_URI && mongoose.connection.readyState !== 1) {
    await ensureDatabaseConnected().catch(() => {});
  }

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

app.use("/api", async (req, res, next) => {
  if (req.path === "/health" || mongoose.connection.readyState === 1) return next();
  try {
    await ensureDatabaseConnected();
    return next();
  } catch {
    return res.status(503).json({
      success: false,
      message: "Database is not connected yet. Please try again shortly.",
      mongoError: lastMongoError,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/mentorship", mentorshipRoutes);
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

async function prepareAuthStorage() {
  if (authStoragePreparationPromise) return authStoragePreparationPromise;
  authStoragePreparationPromise = (async () => {
    try {
      const userIndexes = await User.collection.indexes();
      const obsoleteAuthIndex = userIndexes.find((index) => index.key?.firebaseUid === 1);
      if (obsoleteAuthIndex) await User.collection.dropIndex(obsoleteAuthIndex.name);
    } catch (error) {
      if (![26, 27].includes(error?.code) && !["NamespaceNotFound", "IndexNotFound"].includes(error?.codeName)) throw error;
    }
    try {
      const paymentIndexes = await Payment.collection.indexes();
      const oldRequiredOrderIndex = paymentIndexes.find(
        (index) => index.key?.razorpayOrderId === 1 && index.sparse !== true
      );
      if (oldRequiredOrderIndex) await Payment.collection.dropIndex(oldRequiredOrderIndex.name);
    } catch (error) {
      if (![26, 27].includes(error?.code) && !["NamespaceNotFound", "IndexNotFound"].includes(error?.codeName)) throw error;
    }
    // Enforce UTR and provider transaction uniqueness at the database layer.
    await Payment.createIndexes();
  })().catch((error) => {
    authStoragePreparationPromise = null;
    throw error;
  });
  return authStoragePreparationPromise;
}

async function ensureDatabaseConnected() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!MONGODB_URI) throw new Error("MONGODB_URI is required.");

  if (!mongoConnectPromise) {
    mongoConnectPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: MONGODB_CONNECT_TIMEOUT_MS,
      connectTimeoutMS: MONGODB_CONNECT_TIMEOUT_MS,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 120000,
      family: 4,
    })
      .then(() => {
        lastMongoError = "";
        // Index maintenance is not on the critical authentication request path.
        // Existing indexes remain available while this one-time maintenance runs.
        setTimeout(() => {
          prepareAuthStorage().catch((error) => console.error("MongoDB index preparation failed:", error.message));
        }, 0);
        return mongoose.connection;
      })
      .catch((error) => {
        lastMongoError = safeMongoError(error.message);
        mongoConnectPromise = null;
        throw error;
      });
  }
  return mongoConnectPromise;
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
    await ensureDatabaseConnected();
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  } catch (error) {
    lastMongoError = safeMongoError(error.message);
    console.error(`MongoDB connection failed: ${lastMongoError}`);
    setTimeout(connectDatabase, MONGODB_RETRY_DELAY_MS);
  }
}

function startServer() {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CodePath Learning backend listening on port ${PORT}`);
  });
  startDatabase();
}

if (process.env.VERCEL) {
  startDatabase();
} else {
  startServer();
}

module.exports = app;
