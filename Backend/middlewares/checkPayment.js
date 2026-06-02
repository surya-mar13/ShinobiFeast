import { Order } from "../models/orderModel.js";
import { Payment } from "../models/paymentModel.js";

export const checkPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Already paid online — allow through
    if (order.paymentStatus === "paid") return next();

    // COD — cash is collected at the door, allow through
    const payment = await Payment.findOne({ order: order._id });
    if (payment?.method === "COD") return next();

    // Also allow pending-payment orders — delivery partner collects cash at door
    if (order.paymentStatus === "pending") return next();

    return res.status(400).json({ message: "Payment not completed" });

  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};