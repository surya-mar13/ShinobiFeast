import exp from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";
import {
  getAllUsers,
  toggleBlockUser,
  changeUserRole,
  getAllVendors,
  getAllOrders,
  getPlatformRevenue,
  getDeliveryPartners,
  getAllRestaurants,
  toggleRestaurantOpen
} from "../controllers/adminController.js";

const adminApi = exp.Router();

adminApi.get("/users", verifyToken, checkAdmin, getAllUsers);
adminApi.put("/users/:id/block", verifyToken, checkAdmin, toggleBlockUser);
adminApi.put("/users/:id/role", verifyToken, checkAdmin, changeUserRole);
adminApi.get("/vendors", verifyToken, checkAdmin, getAllVendors);
adminApi.get("/orders", verifyToken, checkAdmin, getAllOrders);
adminApi.get("/revenue", verifyToken, checkAdmin, getPlatformRevenue);
adminApi.get("/deliverypartners", verifyToken, checkAdmin, getDeliveryPartners);
adminApi.get("/restaurants", verifyToken, checkAdmin, getAllRestaurants);
adminApi.put("/restaurants/:id/toggle", verifyToken, checkAdmin, toggleRestaurantOpen);

export default adminApi;