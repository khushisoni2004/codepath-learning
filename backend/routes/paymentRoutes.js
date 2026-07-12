const express = require("express");
const auth = require("../middleware/auth");
const controller = require("../controllers/paymentController");

const router = express.Router();
router.post("/create-order", auth, controller.createOrder);
router.post("/verify", auth, controller.verifyPayment);
router.get("/my-courses", auth, controller.myCourses);
router.get("/receipt/:paymentId", auth, controller.getReceipt);

module.exports = router;
