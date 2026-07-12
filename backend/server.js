const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const registrationRoutes = require("./routes/registrationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
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
  });
});

app.use("/api/registrations", registrationRoutes);
app.use("/api/payments", paymentRoutes);

async function startServer() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is required.");
    }

    await mongoose.connect(MONGODB_URI);

    console.log(`MongoDB connected: ${mongoose.connection.name}`);

    app.listen(PORT, () => {
      console.log(`CodePath Learning backend listening on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Backend startup failed: ${error.message}`);
    process.exit(1);
  }
}

startServer();
