import exp from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { checkDeliveryPartner } from "../middlewares/checkDeliveryPartner.js";
import { checkPayment } from "../middlewares/checkPayment.js";
import { updateDeliveryStatus } from "../controllers/orderController.js";
import { markOutForDelivery,markDelivered,createDeliveryProfile,getAvailableOrders,acceptOrder,getMyDeliveries,getDeliveryHistory,verifyOtp} from "../controllers/deliveryController.js";
import { getMyProfile, updateDeliveryProfile } from "../controllers/deliveryController.js";
const deliveryApi = exp.Router();
deliveryApi.post(
  "/create-profile",
  verifyToken,
  checkDeliveryPartner,
  createDeliveryProfile
);
deliveryApi.get("/profile", verifyToken, checkDeliveryPartner, getMyProfile);
deliveryApi.put("/profile", verifyToken, checkDeliveryPartner, updateDeliveryProfile);
deliveryApi.get(
  "/available-orders",
  verifyToken,
  checkDeliveryPartner,
  getAvailableOrders
);
deliveryApi.get(
  "/my-deliveries",
  verifyToken,
  checkDeliveryPartner,
  getMyDeliveries
);
deliveryApi.get(
  "/history",
  verifyToken,
  checkDeliveryPartner,
  getDeliveryHistory
);
deliveryApi.put(
  "/order/:id/accept",
  verifyToken,
  checkDeliveryPartner,
  acceptOrder
);
deliveryApi.put(
  "/order/:id/out-for-delivery",
  verifyToken,
  checkDeliveryPartner,
  checkPayment,
  markOutForDelivery
);
deliveryApi.put(
  "/order/:id/verify-otp",
  verifyToken,
  checkDeliveryPartner,
  verifyOtp
);
deliveryApi.put(
  "/order/:id/delivered",
  verifyToken,
  checkDeliveryPartner,
  checkPayment,
  markDelivered
);
export default deliveryApi;