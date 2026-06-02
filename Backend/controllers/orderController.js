import { Order } from "../models/orderModel.js";
import { Cart } from "../models/cartModel.js";
import Restaurant from "../models/restaurantModel.js";
import Product from "../models/productModel.js";
import { DeliveryPartner } from "../models/deliveryPartnerModel.js";
import { Payment } from "../models/paymentModel.js";
const allowedTransitions = {
  pending: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["out-for-delivery", "cancelled"],
  "out-for-delivery": ["delivered"],
  delivered: [],
  cancelled: []
};
export const checkout = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { deliveryAddress, couponCode } = req.body;
    const cart = req.cart
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty"
      });
    }
    if (!deliveryAddress || !deliveryAddress.trim()) {
      return res.status(400).json({ message: "Delivery address is required" });
    }
    let subtotal = 0;
    const orderItems = cart.items.map(item => {
      const productPrice = item.product.price;
      const itemSubtotal = productPrice * item.quantity;
      subtotal += itemSubtotal;
      return {
        product: item.product._id,
        quantity: item.quantity,
        priceAtPurchase: productPrice
      };
    });

    // Validate coupon server-side (orderVerification ensures single restaurant)
    let discountAmount = 0;
    if (couponCode) {
      const upperCode = couponCode.trim().toUpperCase();
      const restaurant = cart.items[0]?.product?.restaurant;
      if (restaurant) {
        const coupon = restaurant.coupons?.find(c => c.code === upperCode);
        if (coupon && subtotal >= (coupon.minOrder || 0)) {
          discountAmount = coupon.discountType === "percent"
            ? Math.floor(subtotal * coupon.discountValue / 100)
            : Math.min(coupon.discountValue, subtotal);
        }
      }
    }
    const totalAmount = subtotal - discountAmount;

    const newOrder = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      discountAmount,
      deliveryAddress: deliveryAddress.trim(),
      deliveryOtp: String(Math.floor(100000 + Math.random() * 900000))
    });

    await newOrder.save();
    cart.items = [];
    await cart.save();
    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder
    });
  } catch (err) {
    console.error("Checkout error:", err.message);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .populate("items.product")
      .sort({ createdAt: -1 })
      .lean();

    const orderIds = orders.map((order) => order._id);
    const payments = orderIds.length
      ? await Payment.find({ order: { $in: orderIds } })
          .select("order method")
          .sort({ createdAt: -1 })
          .lean()
      : [];

    const paymentMethodByOrderId = new Map();
    for (const payment of payments) {
      const key = payment.order.toString();
      if (!paymentMethodByOrderId.has(key)) {
        paymentMethodByOrderId.set(key, payment.method);
      }
    }

    const enrichedOrders = orders.map((order) => ({
      ...order,
      paymentMethod: paymentMethodByOrderId.get(order._id.toString()) || null
    }));

    res.json({
      message: "Orders fetched successfully",
      orders: enrichedOrders
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.userId;

    // 1️⃣ Get vendor restaurants
    const restaurants = await Restaurant.find({
      owner: vendorId
    }).select("_id");

    const restaurantIds = restaurants.map(r => r._id);

    // 2️⃣ Get vendor products
    const products = await Product.find({
      restaurant: { $in: restaurantIds }
    }).select("_id");

    const productIds = products.map(p => p._id);

    // 3️⃣ Get orders containing those products (exclude completed/cancelled)
    const orders = await Order.find({
      "items.product": { $in: productIds },
      status: { $nin: ["delivered", "cancelled"] }
    }).populate("items.product user deliveryPartner");

    res.json({
      message: "Vendor orders fetched successfully",
      orders
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const userRole = req.user.role;
    const userId = req.user.userId;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // ❗ Prevent changing delivered or cancelled
    if (["delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        message: "Order cannot be modified"
      });
    }

    // ❗ Check transition validity
    if (!allowedTransitions[order.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${order.status} to ${status}`
      });
    }

    // 🔐 Role-based restrictions

    if (userRole === "vendor") {
      // Vendor can accept, prepare, or cancel
      if (!["accepted", "preparing", "cancelled"].includes(status)) {
        return res.status(403).json({
          message: "Vendor not allowed to set this status"
        });
      }
      // Cannot mark as prepared until a delivery partner has accepted the order
      if (status === "preparing" && !order.deliveryPartner) {
        return res.status(400).json({
          message: "Assign a delivery partner before marking the order as prepared"
        });
      }
    }

    if (userRole === "deliveryPartner") {
      // Delivery partner can only update delivery stages
      if (!["out-for-delivery", "delivered"].includes(status)) {
        return res.status(403).json({
          message: "Delivery partner not allowed to set this status"
        });
      }

      if (order.deliveryPartner?.toString() !== userId) {
        return res.status(403).json({
          message: "You are not assigned to this order"
        });
      }
    }

    if (userRole === "user") {
      if (status !== "cancelled") {
        return res.status(403).json({
          message: "User can only cancel order"
        });
      }
    }

    // 💰 Refund logic if cancelled
    if (status === "cancelled" && order.paymentStatus === "paid") {
      const payment = await Payment.findOne({ order: orderId });

      if (payment && payment.method !== "COD") {
        payment.status = "refunded";
        await payment.save();
      }

      order.paymentStatus = "refunded";
    }

    order.status = status;
    await order.save();

    res.json({
      message: "Order status updated successfully",
      order
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};
export const assignDeliveryPartner = async (req, res) => {
  try {
    const { deliveryPartnerId } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    order.deliveryPartner = deliveryPartnerId;
    order.status = "out-for-delivery";

    await order.save();

    res.json({
      message: "Delivery partner assigned",
      order
    });

  } catch (err) {
    res.status(500).json({
      message: "Internal server error"
    });
  }
};
export const updateDeliveryStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    order.status = "delivered";

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
export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.userId;
    const role = req.user.role;
    const { reason } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.isCancelled) {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    // 🔥 Role restrictions
    if (role === "user") {
      if (!["pending", "accepted"].includes(order.status)) {
        return res.status(400).json({
          message: "Order cannot be cancelled at this stage"
        });
      }

      if (order.user.toString() !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
    }

    if (role === "vendor") {
      if (order.status === "delivered") {
        return res.status(400).json({
          message: "Delivered order cannot be cancelled"
        });
      }
    }

    // ✅ Cancel Order
    order.status = "cancelled";
    order.isCancelled = true;
    order.cancelledBy = role;
    order.cancelReason = reason || "No reason provided";

    // 🔥 Refund Logic
    if (order.paymentStatus === "paid") {
      const payment = await Payment.findOne({ order: orderId });

      if (payment && payment.method !== "COD") {
        payment.status = "refunded";
        await payment.save();
      }

      order.paymentStatus = "refunded";
    }

    await order.save();

    res.json({
      message: "Order cancelled successfully",
      order
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};