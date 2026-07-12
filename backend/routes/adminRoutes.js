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
