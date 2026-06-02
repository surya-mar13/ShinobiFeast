import exp from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { checkVendor } from "../middlewares/checkVendor.js";
import { upload } from "../middlewares/upload.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Restaurant from "../models/restaurantModel.js";

const uploadApi = exp.Router();

// ── helper: build public URL ──────────────────────────────────────────────────
const publicUrl = (req, filePath) => {
  const rel = filePath.replace(/\\/g, "/").split("uploads/")[1];
  return `${req.protocol}://${req.get("host")}/uploads/${rel}`;
};

// ── POST /upload-api/avatar  (logged-in user) ─────────────────────────────────
uploadApi.post(
  "/avatar",
  verifyToken,
  (req, _res, next) => { req.uploadType = "avatars"; next(); },
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      const url = publicUrl(req, req.file.path);
      await User.findByIdAndUpdate(req.user.userId, { avatar: url });
      res.json({ message: "Avatar updated", url });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── POST /upload-api/product/:id  (vendor only) ───────────────────────────────
uploadApi.post(
  "/product/:id",
  verifyToken,
  checkVendor,
  (req, _res, next) => { req.uploadType = "products"; next(); },
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const product = await Product.findById(req.params.id).populate("restaurant");
      if (!product) return res.status(404).json({ message: "Product not found" });
      if (product.restaurant.owner.toString() !== req.user.userId.toString())
        return res.status(403).json({ message: "Unauthorized" });

      const url = publicUrl(req, req.file.path);
      await Product.findByIdAndUpdate(req.params.id, { imageUrl: url });
      res.json({ message: "Product image updated", url });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── POST /upload-api/restaurant/:id  (vendor only) ───────────────────────────
uploadApi.post(
  "/restaurant/:id",
  verifyToken,
  checkVendor,
  (req, _res, next) => { req.uploadType = "restaurants"; next(); },
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const restaurant = await Restaurant.findById(req.params.id);
      if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
      if (restaurant.owner.toString() !== req.user.userId.toString())
        return res.status(403).json({ message: "Unauthorized" });

      const url = publicUrl(req, req.file.path);
      await Restaurant.findByIdAndUpdate(req.params.id, { image: url });
      res.json({ message: "Restaurant image updated", url });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default uploadApi;
