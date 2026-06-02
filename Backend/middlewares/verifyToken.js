import jwt from "jsonwebtoken";
import { config } from "dotenv";
import User from "../models/userModel.js";

config();

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 🔥 Fetch user from DB
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    // 🔒 Check if blocked
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked by admin."
      });
    }

    // Attach full user info
    req.user = {
      userId: user._id,
      role: user.role
    };

    next();

  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};