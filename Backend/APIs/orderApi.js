import exp from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { checkUser } from "../middlewares/checkUser.js";
import { checkVendor } from "../middlewares/checkVendor.js";
import {orderVerification} from "../middlewares/orderVerification.js";
import {checkout,getMyOrders,getVendorOrders,updateOrderStatus,cancelOrder} from "../controllers/orderController.js";

const orderApi = exp.Router();

// User routes
orderApi.post("/checkout", verifyToken, checkUser, orderVerification, checkout);
orderApi.get("/myorders", verifyToken, checkUser, getMyOrders);

// Vendor routes
orderApi.get("/vendor", verifyToken, checkVendor, getVendorOrders);
//Single centralized status update (for user, vendor, delivery)
orderApi.put("/:id/status",verifyToken,updateOrderStatus);
// Cancel order (user or vendor can cancel)
orderApi.delete("/:id/cancel", verifyToken, cancelOrder);
export default orderApi;