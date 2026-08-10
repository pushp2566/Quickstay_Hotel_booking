import crypto from "crypto";
import Booking from "../models/Booking.js";

// Webhook Controller to listen to Razorpay events
// POST /api/razorpay/webhook
export const razorpayWebhooks = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify Razorpay Webhook Signature
    const signature = req.headers["x-razorpay-signature"];

    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(req.body.toString())
        .digest("hex");

      if (signature !== expectedSignature) {
        return res.status(400).json({ success: false, message: "Invalid webhook signature" });
      }
    }

    const event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    switch (event.event) {
      case "order.paid": {
        const orderId = event.payload.order.entity.id;
        const paymentId = event.payload.payment.entity.id;

        await Booking.findOneAndUpdate(
          { razorpayOrderId: orderId },
          { isPaid: true, status: "confirmed", paymentMethod: "Razorpay", razorpayPaymentId: paymentId }
        );
        break;
      }

      case "refund.processed": {
        const refundId = event.payload.refund.entity.id;
        const paymentId = event.payload.refund.entity.payment_id;

        await Booking.findOneAndUpdate(
          { razorpayPaymentId: paymentId },
          { isPaid: false, status: "cancelled", razorpayRefundId: refundId }
        );
        break;
      }

      default:
        break;
    }

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Razorpay Webhook Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
