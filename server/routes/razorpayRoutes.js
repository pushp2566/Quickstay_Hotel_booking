import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createRazorpayOrder, verifyRazorpayPayment, processRefund } from "../controllers/razorpayController.js";

const razorpayRouter = express.Router();

razorpayRouter.post("/create-order", protect, createRazorpayOrder);
razorpayRouter.post("/verify-payment", protect, verifyRazorpayPayment);
razorpayRouter.post("/refund", protect, processRefund);

export default razorpayRouter;
