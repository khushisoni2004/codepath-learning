const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const registrationRoutes = require("./routes/registrationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://127.0.0.1:5174";

app.use(cors({
  origin: [
    FRONTEND_URL,
    "http://localhost:5174",
    "http://127.0.0.1:5174",
  ],
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CodePath Learning API is running.",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend healthy",
    database: mongoose.connection.readyState === 1 ? "connected" : "not connected",
  });
});

app.use("/api/registrations", registrationRoutes);
app.use("/api/payments", paymentRoutes);

async function startServer() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI missing in .env");
    }

    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully.");
    console.log("Database:", mongoose.connection.name);

    app.listen(PORT, () => {
      console.log(`CodePath backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Backend startup failed:");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
