import Product from "../models/productModel.js";
import Restaurant from "../models/restaurantModel.js";

export const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, restaurant: restaurantId } = req.body;

    // 1️⃣ Check restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // 2️⃣ Check vendor owns this restaurant
    if (restaurant.owner.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 3️⃣ Create product
    const product = await Product.create({
      name,
      description,
      price,
      category,
      restaurant: restaurantId
    });

    res.status(201).json({ message: "Product added", product });

  } catch (error) {
    console.log("Global Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("restaurant");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.restaurant.owner.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("restaurant");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.restaurant.owner.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: "Product updated successfully",
      product: updated
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};