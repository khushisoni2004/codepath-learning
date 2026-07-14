const express = require("express");
const auth = require("../middleware/auth");
const controller = require("../controllers/paymentController");

const router = express.Router();
router.post("/create-order", auth, controller.createOrder);
router.post("/verify", auth, controller.verifyPayment);
router.post("/manual-submit", auth, controller.submitManualPayment);
router.get("/manual-status/:courseSlug", auth, controller.getManualPaymentStatus);
router.get("/my-courses", auth, controller.myCourses);
router.get("/student-resource/:resource", auth, controller.getStudentResource);
router.get("/receipt/:paymentId", auth, controller.getReceipt);

module.exports = router;
