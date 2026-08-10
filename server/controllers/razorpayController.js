import crypto from "crypto";
import { getRazorpayInstance } from "../configs/razorpay.js";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";

// API to Create Razorpay Order
// POST /api/razorpay/create-order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user?._id || req.auth?.userId;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID is required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.user !== userId) {
      return res.status(404).json({ success: false, message: "Booking not found or unauthorized" });
    }

    if (booking.isPaid) {
      return res.status(400).json({ success: false, message: "Booking is already paid" });
    }

    const roomData = await Room.findById(booking.room).populate("hotel");
    if (!roomData?.hotel) {
      return res.status(404).json({ success: false, message: "Room or Hotel data not found" });
    }

    // Amount in paise (1 INR = 100 paise)
    const rawAmount = Number(booking.totalPrice) || 0;
    const amountInPaise = Math.round(rawAmount * 100);

    if (amountInPaise <= 0) {
      return res.status(400).json({ success: false, message: "Invalid booking amount" });
    }

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: String(bookingId).slice(0, 40),
      notes: {
        bookingId: String(bookingId),
        hotelName: String(roomData.hotel.name || "Quickstay Hotel"),
      },
    };

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);

    // Save orderId to booking
    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      hotelName: roomData.hotel.name,
    });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    const errorMessage = error?.error?.description || error?.description || error?.message || "Failed to create Razorpay Order";
    res.status(500).json({ success: false, message: errorMessage });
  }
};

// API to Verify Razorpay Payment Signature
// POST /api/razorpay/verify-payment
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ success: false, message: "Invalid payment payload" });
    }

    // Generate expected HMAC-SHA256 signature
    const bodyData = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(bodyData.toString())
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (isSignatureValid) {
      await Booking.findByIdAndUpdate(bookingId, {
        isPaid: true,
        status: "confirmed",
        paymentMethod: "Razorpay",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });

      return res.json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Payment verification failed: Invalid signature" });
    }
  } catch (error) {
    console.error("Razorpay Verify Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Payment verification failed" });
  }
};

// API to Process Refund
// POST /api/razorpay/refund
export const processRefund = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user?._id || req.auth?.userId;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.user !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Booking is already cancelled" });
    }

    if (booking.isPaid && booking.razorpayPaymentId) {
      let refundId = null;
      try {
        const razorpay = getRazorpayInstance();
        const refund = await razorpay.payments.refund(booking.razorpayPaymentId, {
          amount: Math.round(Number(booking.totalPrice) * 100),
          speed: "normal",
          notes: {
            reason: "User cancelled booking",
            bookingId: String(bookingId),
          },
        });
        refundId = refund.id;
        booking.razorpayRefundId = refundId;
      } catch (refundErr) {
        console.warn("Razorpay Refund API notice:", refundErr?.error?.description || refundErr.message);
      }

      booking.status = "cancelled";
      booking.isPaid = false;
      await booking.save();

      return res.json({
        success: true,
        message: refundId
          ? "Booking cancelled and refund processed successfully"
          : "Booking cancelled successfully",
        refundId,
      });
    } else {
      // Cancel un-paid or Pay-At-Hotel booking
      booking.status = "cancelled";
      await booking.save();
      return res.json({ success: true, message: "Booking cancelled successfully" });
    }
  } catch (error) {
    console.error("Refund Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Refund failed" });
  }
};
