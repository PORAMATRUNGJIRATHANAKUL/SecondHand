import express from "express";
import {
  placeOrder,
  placeOrderQRCode,
  verifyQRCodePayment,
  allOrders,
  userOrders,
  updateStatus,
  getQRCodePaymentOrders,
  getQRCodePaymentList,
  deleteOrder,
  getShopOrdersByUserId,
  updateShippingInfo,
  transferToShop,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const orderRouter = express.Router();

// Admin Features
orderRouter.post("/list", allOrders);
orderRouter.post("/status", authUser, updateStatus);
orderRouter.delete("/delete/:id", authUser, deleteOrder);

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
orderRouter.get("/shop-orders", authUser, getShopOrdersByUserId);
orderRouter.get("/shop-qr-orders", adminAuth, getQRCodePaymentOrders);

orderRouter.post("/transfer-status", adminAuth, transferToShop);
// QR Code Payment List
orderRouter.get("/qr-payment-list", authUser, getQRCodePaymentList);

// Shipping Features
orderRouter.post("/shipping", authUser, updateShippingInfo);

export default orderRouter;
