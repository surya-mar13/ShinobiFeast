import Restaurant from "../models/restaurantModel.js";
import Product from "../models/productModel.js";
import { Order } from "../models/orderModel.js";

// Vendor Restaurants
export const getMyRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      owner: req.user.userId
    }).populate("owner", "name email");

    res.json({
      message: "Restaurants fetched successfully",
      restaurants
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Vendor Products
export const getMyProducts = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      owner: req.user.userId
    }).select("_id");

    const ids = restaurants.map(r => r._id);

    const products = await Product.find({
      restaurant: { $in: ids }
    }).populate('restaurant', 'name');

    res.json({
      message: "Products fetched successfully",
      products
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getVendorRevenue = async (req, res) => {
  const vendorId = req.user.userId;

  const restaurants = await Restaurant.find({ owner: vendorId }).select("_id");
  const restaurantIds = restaurants.map(r => r._id);

  const products = await Product.find({
    restaurant: { $in: restaurantIds }
  }).select("_id");

  const productIds = products.map(p => p._id);

  const orders = await Order.find({
    "items.product": { $in: productIds },
    paymentStatus: "paid"
  });

  const totalEarnings = orders.reduce(
    (sum, order) => sum + order.vendorEarning,
    0
  );

  res.json({
    totalEarnings
  });
};