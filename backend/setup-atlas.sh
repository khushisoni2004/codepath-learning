#!/bin/bash

set -e

echo ""
echo "========================================"
echo " CodePath Learning - Atlas Auto Setup"
echo "========================================"
echo ""

read -p "Atlas database username [codepathadmin]: " DB_USERNAME
DB_USERNAME=${DB_USERNAME:-codepathadmin}

read -s -p "Atlas database password: " DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
  echo "Password empty nahi ho sakta."
  exit 1
fi

read -p "Atlas cluster host [cluster0.huzdt.mongodb.net]: " CLUSTER_HOST
CLUSTER_HOST=${CLUSTER_HOST:-cluster0.huzdt.mongodb.net}

read -p "Frontend URL [http://localhost:5174]: " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-http://localhost:5174}

read -p "Private admin key [my-codepath-private-key-2026]: " ADMIN_KEY
ADMIN_KEY=${ADMIN_KEY:-my-codepath-private-key-2026}

echo ""
echo "Existing backend ka backup banaya ja raha hai..."

BACKUP_DIR="backup-before-atlas-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

[ -f server.js ] && cp server.js "$BACKUP_DIR/server.js"
[ -d routes ] && cp -R routes "$BACKUP_DIR/routes"
[ -d models ] && cp -R models "$BACKUP_DIR/models"
[ -d utils ] && cp -R utils "$BACKUP_DIR/utils"
[ -f .env ] && cp .env "$BACKUP_DIR/.env"

echo "Backup created: $BACKUP_DIR"

mkdir -p models routes utils

echo ""
echo "Installing required packages..."

npm install express mongoose cors dotenv
npm install --save-dev nodemon

npm pkg set scripts.start="node server.js"
npm pkg set scripts.dev="nodemon server.js"
npm pkg set engines.node="22.x"

ENCODED_PASSWORD=$(node -e \
  'console.log(encodeURIComponent(process.argv[1]))' \
  "$DB_PASSWORD"
)

MONGO_URI="mongodb+srv://${DB_USERNAME}:${ENCODED_PASSWORD}@${CLUSTER_HOST}/codepath_learning?retryWrites=true&w=majority"

echo ""
echo "Creating environment file..."

cat > .env <<EOF
PORT=5001
MONGO_URI=${MONGO_URI}
ADMIN_KEY=${ADMIN_KEY}
FRONTEND_URL=${FRONTEND_URL}
EOF

cat > .gitignore <<'EOF'
.env
.env.local
node_modules/
data/
*.log
.DS_Store
EOF

echo "Creating Counter model..."

cat > models/Counter.js <<'EOF'
const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    value: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Counter", counterSchema);
EOF

echo "Creating Registration model..."

cat > models/Registration.js <<'EOF'
const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    collegeName: {
      type: String,
      default: "",
      trim: true,
    },

    course: {
      type: String,
      required: true,
      trim: true,
    },

    plan: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      enum: [599],
    },

    utrNumber: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Submitted",
        "Verified",
        "Rejected",
      ],
      default: "Pending",
    },

    enrollmentStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Cancelled",
      ],
      default: "Pending",
    },

    paymentSubmittedAt: {
      type: Date,
      default: null,
    },

    paymentVerifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Registration",
  registrationSchema
);
EOF

echo "Creating registration ID generator..."

cat > utils/generateRegistrationId.js <<'EOF'
const Counter = require("../models/Counter");

async function generateRegistrationId() {
  const year = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    {
      name: `registration-${year}`,
    },
    {
      $inc: {
        value: 1,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  const serial = String(counter.value).padStart(5, "0");

  return `CPL-REG-${year}-${serial}`;
}

module.exports = generateRegistrationId;
EOF

echo "Creating registration API..."

cat > routes/registrationRoutes.js <<'EOF'
const express = require("express");

const Registration = require("../models/Registration");
const generateRegistrationId = require(
  "../utils/generateRegistrationId"
);

const router = express.Router();

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

router.post("/", async (req, res) => {
  try {
    const studentName = clean(req.body.studentName);
    const email = clean(req.body.email).toLowerCase();
    const phone = clean(req.body.phone).replace(/\D/g, "");
    const collegeName = clean(req.body.collegeName);
    const course = clean(req.body.course);
    const plan = clean(req.body.plan);

    if (!studentName || !email || !phone || !course || !plan) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (phone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit number.",
      });
    }

    const existing = await Registration.findOne({
      email,
      course,
      enrollmentStatus: {
        $ne: "Cancelled",
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You are already registered for this course.",
        registrationId: existing.registrationId,
      });
    }

    const amount = 599;
    const registrationId = await generateRegistrationId();

    const registration = await Registration.create({
      registrationId,
      studentName,
      email,
      phone,
      collegeName,
      course,
      plan,
      amount,
    });

    return res.status(201).json({
      success: true,
      message: "Registration completed successfully.",
      registrationId,
      registration,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete registration.",
    });
  }
});

router.patch("/:registrationId/payment", async (req, res) => {
  try {
    const registrationId = clean(
      req.params.registrationId
    ).toUpperCase();

    const utrNumber = clean(
      req.body.utrNumber || req.body.utr
    ).toUpperCase();

    if (utrNumber.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid UTR or transaction ID.",
      });
    }

    const duplicate = await Registration.findOne({
      utrNumber,
      registrationId: {
        $ne: registrationId,
      },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "This transaction ID is already submitted.",
      });
    }

    const registration = await Registration.findOneAndUpdate(
      {
        registrationId,
      },
      {
        utrNumber,
        paymentStatus: "Submitted",
        paymentSubmittedAt: new Date(),
      },
      {
        new: true,
      }
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found.",
      });
    }

    return res.json({
      success: true,
      message: "Payment submitted for verification.",
      registration,
    });
  } catch (error) {
    console.error("Payment submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit payment.",
    });
  }
});

router.get("/verify/:registrationId", async (req, res) => {
  try {
    const registrationId = clean(
      req.params.registrationId
    ).toUpperCase();

    const registration = await Registration.findOne({
      registrationId,
    }).select(
      "registrationId studentName course amount paymentStatus enrollmentStatus createdAt"
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: "Registration not found.",
      });
    }

    const verified =
      registration.paymentStatus === "Verified" &&
      registration.enrollmentStatus === "Confirmed";

    return res.json({
      success: true,
      verified,
      valid: verified,
      registration,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      verified: false,
      message: "Unable to verify registration.",
    });
  }
});

module.exports = router;
EOF

echo "Creating admin verification API..."

cat > routes/adminRoutes.js <<'EOF'
const express = require("express");
const Registration = require("../models/Registration");

const router = express.Router();

function verifyAdmin(req, res, next) {
  const adminKey = req.headers["x-admin-key"];

  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({
      success: false,
      message: "Invalid admin key.",
    });
  }

  next();
}

router.get("/payments", verifyAdmin, async (req, res) => {
  try {
    const registrations = await Registration.find({
      paymentStatus: {
        $in: ["Submitted", "Verified", "Rejected"],
      },
    }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      registrations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load payment records.",
    });
  }
});

router.patch(
  "/payments/:registrationId",
  verifyAdmin,
  async (req, res) => {
    try {
      const registrationId =
        req.params.registrationId.toUpperCase();

      const action = req.body.action;

      if (!["verify", "reject"].includes(action)) {
        return res.status(400).json({
          success: false,
          message: "Invalid action.",
        });
      }

      const update =
        action === "verify"
          ? {
              paymentStatus: "Verified",
              enrollmentStatus: "Confirmed",
              paymentVerifiedAt: new Date(),
            }
          : {
              paymentStatus: "Rejected",
              enrollmentStatus: "Pending",
              paymentVerifiedAt: null,
            };

      const registration =
        await Registration.findOneAndUpdate(
          {
            registrationId,
          },
          update,
          {
            new: true,
          }
        );

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: "Registration not found.",
        });
      }

      return res.json({
        success: true,
        message:
          action === "verify"
            ? "Payment verified successfully."
            : "Payment rejected.",
        registration,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Unable to update payment status.",
      });
    }
  }
);

module.exports = router;
EOF

echo "Creating Atlas-connected server..."

cat > server.js <<'EOF'
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const registrationRoutes = require(
  "./routes/registrationRoutes"
);
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://codepath-learning.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      );
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CodePath Learning API is running.",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

app.use("/api/registrations", registrationRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Atlas connected successfully.");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `CodePath backend running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Backend startup failed:");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
EOF

echo ""
echo "Checking JavaScript files..."

node --check server.js
node --check models/Counter.js
node --check models/Registration.js
node --check routes/registrationRoutes.js
node --check routes/adminRoutes.js
node --check utils/generateRegistrationId.js

echo ""
echo "Testing MongoDB Atlas connection..."

node <<'NODE'
require("dotenv").config();
const mongoose = require("mongoose");

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Atlas connection successful");

    const database = mongoose.connection.db;
    const collections = await database
      .listCollections()
      .toArray();

    console.log(
      "Collections:",
      collections.map((item) => item.name)
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Atlas connection failed:");
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
NODE

echo ""
echo "========================================"
echo " Setup completed successfully"
echo "========================================"
echo ""
echo "Starting backend..."
echo ""

npm run dev
