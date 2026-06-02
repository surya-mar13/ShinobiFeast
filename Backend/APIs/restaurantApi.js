import exp from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { checkVendor } from "../middlewares/checkVendor.js";
import {registerRestaurant,deleteRestaurant,updateRestaurant} from "../controllers/restaurantController.js";

const restaurantApi = exp.Router();
restaurantApi.post("/registerrestaurant",verifyToken,checkVendor,registerRestaurant);
restaurantApi.delete("/deleterestaurant/:id",verifyToken,checkVendor,deleteRestaurant);
restaurantApi.put("/updaterestaurant/:id",verifyToken,checkVendor,updateRestaurant);

export default restaurantApi;