import { Payment } from "../models/paymentModel.js";
import { Order } from "../models/orderModel.js";
import crypto from "crypto";
import { razorpay } from "../utils/razorpay.js";

// ─── helpers ────────────────────────────────────────────────────────────────
const ALLOWED_METHODS = ["COD", "UPI", "CARD"];

const isCardExpired = (month, year) => {
  const now = new Date();
  const expiry = new Date(Number(year), Number(month) - 1, 1); // 1st of expiry month
  // card is valid through the end of expiry month
  expiry.setMonth(expiry.getMonth() + 1);
  return expiry <= now;
};

// ─── makePayment ────────────────────────────────────────────────────────────
export const makePayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      orderId,
      method,
      codPreference,
      // CARD fields
      cardNumber,
      cardHolderName,
      expiryMonth,
      expiryYear,
      cvv,
      // UPI field
      upiId
    } = req.body;

    // ── 1. Validate method ──────────────────────────────────────────────────
    if (!method || !ALLOWED_METHODS.includes(method)) {
      return res.status(400).json({
        message: `Invalid payment method. Allowed: ${ALLOWED_METHODS.join(", ")}`
      });
    }

    // ── 2. Fetch & authorise order ──────────────────────────────────────────
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    if (method !== "COD") {
      return res.status(400).json({
        message: "Online payments must be processed through Razorpay checkout"
      });
    }

    // ── 3. Method-specific validation ───────────────────────────────────────
    if (method === "CARD") {
      if (!cardNumber || !cardHolderName || !expiryMonth || !expiryYear || !cvv) {
        return res.status(400).json({ message: "All card details are required" });
      }

      const digits = cardNumber.replace(/\s+/g, "");
      if (!/^\d{16}$/.test(digits)) {
        return res.status(400).json({ message: "Card number must be exactly 16 digits" });
      }

      const month = Number(expiryMonth);
      const year = Number(expiryYear);
      if (month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid expiry month" });
      }
      if (year < 2000 || year > 2100) {
        return res.status(400).json({ message: "Invalid expiry year" });
      }
      if (isCardExpired(month, year)) {
        return res.status(400).json({ message: "Card has expired" });
      }

      if (!/^\d{3,4}$/.test(cvv)) {
        return res.status(400).json({ message: "CVV must be 3 or 4 digits" });
      }

      if (cardHolderName.trim().length < 3) {
        return res.status(400).json({ message: "Invalid card holder name" });
      }
    }

    if (method === "UPI") {
      if (!upiId || !upiId.trim()) {
        return res.status(400).json({ message: "UPI ID is required" });
      }
      // standard UPI format: localpart@provider  e.g. user@okaxis
      if (!/^[\w.\-+]+@[a-zA-Z]{3,}$/.test(upiId.trim())) {
        return res.status(400).json({ message: "Invalid UPI ID format (e.g. name@okaxis)" });
      }
    }

    // ── 4. Build payment record ─────────────────────────────────────────────
    const commissionPercent = parseInt(process.env.PLATFORM_COMMISSION_PERCENT) || 10;
    const commissionAmount = (order.totalAmount * commissionPercent) / 100;

    const paymentData = {
      order: orderId,
      user: userId,
      amount: order.totalAmount,
      method,
      status: method === "COD" ? "pending" : "success",
      transactionId: "TXN" + Date.now()
    };

    if (method === "CARD") {
      paymentData.cardDetails = {
        cardHolderName: cardHolderName.trim(),
        last4Digits: cardNumber.replace(/\s+/g, "").slice(-4),
        expiryMonth: String(expiryMonth),
        expiryYear: String(expiryYear)
        // CVV is never stored
      };
    }

    const payment = await Payment.create(paymentData);

    // ── 5. Update order ─────────────────────────────────────────────────────
    if (method !== "COD") {
      order.paymentStatus = "paid";
      order.status = "accepted";
      order.platformCommission = commissionAmount;
      order.vendorEarning = order.totalAmount - commissionAmount;
    } else {
      order.paymentStatus = "pending";
      if (codPreference && ["cash", "upi"].includes(codPreference)) {
        order.codPreference = codPreference;
      }
    }

    await order.save();

    res.json({
      message:
        method === "COD"
          ? "Order placed with Cash on Delivery"
          : "Payment successful",
      payment
    });
  } catch (err) {
    console.error("makePayment error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.userId;

    // ✅ 1. FIRST fetch order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // ✅ 3. THEN create Razorpay order
    const options = {
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      receipt: `receipt_${order._id}`,
      notes: {
        orderId: order._id.toString()
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.status(200).json({
      message: "Razorpay order created successfully",
      razorpayOrder
    });

  } catch (error) {
    console.error("Create Razorpay Error:", error);
    return res.status(500).json({
      message: error.message
    });
  }
};
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    // 🔐 Generate expected signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    // ❌ If signature doesn't match
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Invalid payment signature"
      });
    }

    // 🔍 Find order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // ✅ Update order
   const commissionPercent = parseInt(process.env.PLATFORM_COMMISSION_PERCENT) || 10;

const commissionAmount = (order.totalAmount * commissionPercent) / 100;
const vendorAmount = order.totalAmount - commissionAmount;

order.platformCommission = commissionAmount;
order.vendorEarning = vendorAmount;

order.paymentStatus = "paid";
order.status = "accepted";

    await order.save();

    // 💾 Save payment record
    await Payment.create({
      order: orderId,
      user: order.user,
      amount: order.totalAmount,
      method: "CARD",
      status: "success",
      transactionId: razorpay_payment_id
    });

    res.status(200).json({
      message: "Payment verified successfully"
    });

  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};
// ─── createDeliveryRazorpayOrder ────────────────────────────────────────────
// Called by the delivery partner to start a Razorpay UPI collection at the door
export const createDeliveryRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const deliveryUserId = req.user.userId;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!order.deliveryPartner || order.deliveryPartner.toString() !== deliveryUserId) {
      return res.status(403).json({ message: "You are not assigned to this order" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    if (order.codPreference !== "upi") {
      return res.status(400).json({ message: "This order is not set for UPI payment" });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      receipt: `delivery_${order._id}`,
      notes: { orderId: order._id.toString() }
    });

    return res.status(200).json({ razorpayOrder });
  } catch (err) {
    console.error("Delivery Razorpay order error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── verifyDeliveryRazorpayPayment ───────────────────────────────────────────
export const verifyDeliveryRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const deliveryUserId = req.user.userId;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!order.deliveryPartner || order.deliveryPartner.toString() !== deliveryUserId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    const commissionPercent = parseInt(process.env.PLATFORM_COMMISSION_PERCENT) || 10;
    const commissionAmount = (order.totalAmount * commissionPercent) / 100;
    order.paymentStatus = "paid";
    order.platformCommission = commissionAmount;
    order.vendorEarning = order.totalAmount - commissionAmount;
    await order.save();

    await Payment.create({
      order: orderId,
      user: order.user,
      amount: order.totalAmount,
      method: "UPI",
      status: "success",
      transactionId: razorpay_payment_id
    });

    res.json({ message: "Payment collected and verified" });
  } catch (err) {
    console.error("Delivery verify error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());

    console.log("Event type:", event.event);

    if (event.event === "payment.captured") {
      const orderId = event.payload.payment.entity.notes.orderId;

      const order = await Order.findById(orderId);

      if (!order) return res.status(404).send("Order not found");

      const commissionPercent =
        parseInt(process.env.PLATFORM_COMMISSION_PERCENT) || 10;

      const commissionAmount =
        (order.totalAmount * commissionPercent) / 100;

      order.platformCommission = commissionAmount;
      order.vendorEarning = order.totalAmount - commissionAmount;
      order.paymentStatus = "paid";
      order.status = "accepted";

      await order.save();

      console.log("Order updated via webhook");
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).send("Webhook failed");
  }
};