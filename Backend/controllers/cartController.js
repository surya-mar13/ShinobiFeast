import { Cart } from "../models/cartModel.js";
import Product from "../models/productModel.js";
import { Types } from "mongoose";
// Add to Cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    if (!Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    // If cart doesn't exist → create new
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity: quantity || 1 }]
      });

      await cart.save();

      return res.status(201).json({
        message: "Product added to cart",
        cart
      });
    }

    // If cart exists → check if product already inside
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Product exists → increase quantity
      cart.items[itemIndex].quantity += quantity || 1;
    } else {
      // New product
      cart.items.push({ product: productId, quantity: quantity || 1 });
    }

    await cart.save();

    res.json({
      message: "Cart updated successfully",
      cart
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Update Cart Quantity
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    cart.items[itemIndex].quantity = quantity;

    await cart.save();

    res.json({
      message: "Quantity updated successfully",
      cart
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Remove from Cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();

    res.json({
      message: "Product removed from cart",
      cart
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get Cart
  export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ user: userId })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.json({
        message: "Cart is empty",
        items: [],
        totalAmount: 0
      });
    }

    let totalAmount = 0;

    cart.items.forEach(item => {
      const productPrice = item.product.price;
      totalAmount += productPrice * item.quantity;
    });

    res.json({
      message: "Cart fetched successfully",
      cart,
      totalAmount
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};