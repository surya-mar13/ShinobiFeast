import exp from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { checkUser } from "../middlewares/checkUser.js";
import {addToCart,updateCartQuantity,removeFromCart,getCart} from "../controllers/cartController.js";
const cartApi = exp.Router();

cartApi.post("/add", verifyToken, checkUser, addToCart);
cartApi.put("/update", verifyToken, checkUser, updateCartQuantity);
cartApi.delete("/remove/:productId", verifyToken, checkUser, removeFromCart);
cartApi.get("/", verifyToken, checkUser, getCart);

export default cartApi;