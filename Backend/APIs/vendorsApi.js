import exp from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { checkVendor } from "../middlewares/checkVendor.js";
import {getMyRestaurants,getMyProducts,getVendorRevenue} from "../controllers/vendorController.js";
const vendorsApi = exp.Router();
vendorsApi.get("/myrestaurants",verifyToken,checkVendor,getMyRestaurants);
vendorsApi.get("/revenue",verifyToken,checkVendor,getVendorRevenue);
vendorsApi.get("/myproducts",verifyToken,checkVendor,getMyProducts);
export default vendorsApi;