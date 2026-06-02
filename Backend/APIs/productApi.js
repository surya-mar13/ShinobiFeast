import exp from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { checkVendor } from "../middlewares/checkVendor.js";
import {addProduct,deleteProduct,updateProduct} from "../controllers/productController.js";

const productApi = exp.Router();

productApi.post("/addproduct",verifyToken,checkVendor,addProduct);
productApi.delete("/deleteproduct/:id",verifyToken,checkVendor,deleteProduct);
productApi.put("/updateproduct/:id",verifyToken,checkVendor,updateProduct);

export default productApi;