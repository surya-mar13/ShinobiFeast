import exp from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { checkUser } from "../middlewares/checkUser.js";
import { checkDeliveryPartner } from "../middlewares/checkDeliveryPartner.js";
import {
  makePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  createDeliveryRazorpayOrder,
  verifyDeliveryRazorpayPayment
} from "../controllers/paymentController.js";

const paymentApi = exp.Router();

paymentApi.post("/pay", verifyToken, checkUser, makePayment);
paymentApi.post("/create-order", verifyToken, createRazorpayOrder);
paymentApi.post("/verify", verifyToken, verifyRazorpayPayment);

// Delivery partner — collect UPI via Razorpay at the door
paymentApi.post("/delivery/create-order", verifyToken, checkDeliveryPartner, createDeliveryRazorpayOrder);
paymentApi.post("/delivery/verify", verifyToken, checkDeliveryPartner, verifyDeliveryRazorpayPayment);

export default paymentApi;