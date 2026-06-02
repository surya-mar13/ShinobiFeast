import User from "../models/userModel.js";
import { Payment } from "../models/paymentModel.js";
import { Order } from "../models/orderModel.js";
import { DeliveryPartner } from "../models/deliveryPartnerModel.js";
import Restaurant from "../models/restaurantModel.js";
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ message: "Users fetched successfully", users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({
      message: `User ${user.isBlocked ? "blocked" : "unblocked"}`,
      user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = ["user", "vendor", "deliveryPartner", "admin"];
    if (!allowed.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: "-password" }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: `Role changed to ${role}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor" }).select("-password");
    res.json({ message: "Vendors fetched successfully", vendors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user")
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json({ message: "Orders fetched successfully", orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getPlatformRevenue = async (req, res) => {
  try {
    const orders = await Order.find({ paymentStatus: "paid" });
    const totalCommission = orders.reduce(
      (sum, order) => sum + (order.platformCommission || 0),
      0
    );
    res.json({ totalRevenue: totalCommission, totalCommission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDeliveryPartners = async (req, res) => {
  try {
    const partners = await DeliveryPartner.find()
      .populate("user", "name email phone isBlocked")
      .sort({ createdAt: -1 });
    res.json({ message: "Delivery partners fetched successfully", partners });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
    res.json({ message: "Restaurants fetched successfully", restaurants });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleRestaurantOpen = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    restaurant.isOpen = !restaurant.isOpen;
    await restaurant.save();
    res.json({ message: `Restaurant ${restaurant.isOpen ? "opened" : "closed"}`, restaurant });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};