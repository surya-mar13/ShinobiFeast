import { DeliveryPartner } from "../models/deliveryPartnerModel.js";
import { Order } from "../models/orderModel.js";
import { Payment } from "../models/paymentModel.js";
export const createDeliveryProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { vehicleType, vehicleNumber, currentLocation } = req.body;

    const existingProfile = await DeliveryPartner.findOne({
      user: userId
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Profile already exists"
      });
    }

    const profile = await DeliveryPartner.create({
      user: userId,
      vehicleType,
      vehicleNumber,
      currentLocation
    });

    res.status(201).json({
      message: "Delivery profile created successfully",
      profile
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};
export const getMyDeliveries = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({
      deliveryPartner: userId,
      status: { $in: ["accepted", "preparing", "out-for-delivery"] }
    })
      .populate("user", "name phone")
      .populate("items.product", "name price imageUrl")
      .sort({ updatedAt: -1 });

    res.json({
      message: "My deliveries fetched successfully",
      orders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDeliveryHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({
      deliveryPartner: userId,
      status: { $in: ["delivered", "cancelled"] }
    })
      .populate("user", "name phone")
      .populate("items.product", "name price imageUrl")
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json({ message: "Delivery history fetched", orders });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getAvailableOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: "accepted",
      deliveryPartner: null
    })
      .populate("user")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json({
      message: "Available orders fetched successfully",
      orders
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};
export const acceptOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const deliveryUserId = req.user.userId;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (order.deliveryPartner) {
      return res.status(400).json({
        message: "Order already assigned"
      });
    }

    order.deliveryPartner = deliveryUserId;
    // Keep status as "accepted" — partner calls markOutForDelivery when picked up
    await order.save();

    res.json({
      message: "Order accepted successfully",
      order
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};
export const markOutForDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // Only allow pickup once vendor has marked the order as prepared
    if (order.status !== "preparing") {
      return res.status(400).json({
        message: "Order must be marked as prepared by the vendor before pickup"
      });
    }

    order.status = "out-for-delivery";
    await order.save();

    res.json({
      message: "Order marked as out for delivery",
      order
    });

  } catch (err) {
    res.status(500).json({
      message: "Internal server error"
    });
  }
};
export const verifyOtp = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "out-for-delivery") {
      return res.status(400).json({ message: "Order must be out-for-delivery to verify OTP" });
    }

    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: "OTP is required" });

    if (String(otp).trim() !== String(order.deliveryOtp)) {
      return res.status(400).json({ message: "Invalid OTP. Please check with the customer." });
    }

    order.otpVerified = true;
    await order.save();

    res.json({ message: "OTP verified successfully", otpVerified: true });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const markDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // ❗ Only allow if currently out-for-delivery
    if (order.status !== "out-for-delivery") {
      return res.status(400).json({
        message: "Order must be out for delivery before marking delivered"
      });
    }

    // ❗ Require OTP to be verified first
    if (!order.otpVerified) {
      return res.status(400).json({
        message: "Please verify the delivery OTP from the customer before marking delivered"
      });
    }

    order.status = "delivered";

    // Auto-finalize COD payment — cash collected at door
    if (order.paymentStatus !== "paid") {
      const payment = await Payment.findOne({ order: order._id });
      if (payment?.method === "COD") {
        payment.status = "success";
        await payment.save();

        const commissionPercent = parseInt(process.env.PLATFORM_COMMISSION_PERCENT) || 10;
        order.paymentStatus = "paid";
        order.platformCommission = (order.totalAmount * commissionPercent) / 100;
        order.vendorEarning = order.totalAmount - order.platformCommission;
      }
    }

    await order.save();

    res.json({
      message: "Order delivered successfully",
      order
    });

  } catch (err) {
    res.status(500).json({
      message: "Internal server error"
    });
  }
};
  export const getMyProfile = async (req, res) => {
    try {
      const profile = await DeliveryPartner.findOne({ user: req.user.userId }).populate("user", "name email phone");
      if (!profile) return res.status(404).json({ message: "Profile not found" });
      res.json({ message: "Profile fetched", profile });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  };
  export const updateDeliveryProfile = async (req, res) => {
    try {
      const { vehicleType, vehicleNumber, currentLocation } = req.body;
      const profile = await DeliveryPartner.findOneAndUpdate(
        { user: req.user.userId },
        { vehicleType, vehicleNumber, currentLocation },
        { new: true, runValidators: true }
      );
      if (!profile) return res.status(404).json({ message: "Profile not found. Create one first." });
      res.json({ message: "Profile updated", profile });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  };