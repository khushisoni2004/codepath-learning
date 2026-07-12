const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const registrationRoutes = require("./routes/registrationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_CONNECT_TIMEOUT_MS = 30000;
const MONGODB_RETRY_DELAY_MS = 10000;
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
  res.json({
    success: true,
    message: "CodePath Learning backend running",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
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

  if (!MONGODB_URI) {
    console.error("MongoDB connection skipped: MONGODB_URI is required.");
    return;
  }

  connectDatabase();
}

async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: MONGODB_CONNECT_TIMEOUT_MS,
      connectTimeoutMS: MONGODB_CONNECT_TIMEOUT_MS,
    });

    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    setTimeout(connectDatabase, MONGODB_RETRY_DELAY_MS);
  }
}

startServer();
