import { Cart } from "../models/cartModel.js";

export const orderVerification = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        populate: {
          path: "restaurant"
        }
      });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty"
      });
    }
    const restaurantIds = new Set();

    cart.items.forEach(item => {
      restaurantIds.add(
        item.product.restaurant._id.toString()
      );
    });

    if (restaurantIds.size > 1) {
      return res.status(400).json({
        message: "All items must belong to the same restaurant."
      });
    }
    req.cart = cart;
    next();
  } catch (error) {
    console.error("Order verification error:", error.message);
    res.status(500).json({
      message: "Internal server error during order verification."
    });
  }
};