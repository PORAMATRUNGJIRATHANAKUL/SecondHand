import express from "express";
import {
  placeOrder,
  placeOrderQRCode,
  verifyQRCodePayment,
  allOrders,
  userOrders,
  updateStatus,
  getQRCodePaymentList,
  deleteOrder,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const orderRouter = express.Router();

// Admin Features
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.delete("/delete/:id", adminAuth, deleteOrder);

// Payment Features
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/place-qr", authUser, placeOrderQRCode);
orderRouter.post(
  "/verify-qr",
  authUser,
  upload.fields([{ name: "paymentProof", maxCount: 1 }]),
  verifyQRCodePayment
);

// User Feature
orderRouter.post("/userorders", authUser, userOrders);

// QR Code Payment List
orderRouter.get("/qr-payment-list", adminAuth, getQRCodePaymentList);

export default orderRouter;
