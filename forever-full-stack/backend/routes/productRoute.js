import express from "express";
import {
  listProducts,
  addProduct,
  removeProduct,
  removeProductAdmin,
  singleProduct,
  getProductsByOwner,
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import userAuth from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
const productRouter = express.Router();

productRouter.post(
  "/add",
  userAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
    { name: "sizeGuide", maxCount: 1 },
  ]),
  addProduct
);
productRouter.post("/remove", userAuth, removeProduct);
productRouter.post("/removeAdmin", adminAuth, removeProductAdmin);
productRouter.post("/single", singleProduct);
productRouter.get("/list", listProducts);
productRouter.get("/owner", userAuth, getProductsByOwner);
export default productRouter;
