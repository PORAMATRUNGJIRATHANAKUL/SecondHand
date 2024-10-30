import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";
import productModel from "../models/productModel.js";

// global variables
const currency = "thb";
const deliveryCharge = 10;

const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const result = await orderModel.findByIdAndDelete(orderId);

    if (result) {
      res.json({
        success: true,
        message: "Order deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: error.message,
    });
  }
};

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address, paymentMethod, paymentProof } =
      req.body;

    // Update stock for each item
    for (const item of items) {
      const product = await productModel.findById(item._id);
      if (!product) {
        throw new Error(`Product not found: ${item._id}`);
      }

      // Find the specific size and color combination
      const stockIndex = product.stockItems.findIndex(
        (s) => s.size === item.size && s.color === item.colors[0]
      );

      if (stockIndex === -1) {
        throw new Error(
          `Size ${item.size} and color ${item.colors[0]} combination not found`
        );
      }

      console.log("Before stock update:", product.stockItems[stockIndex].stock);
      const newStock = product.stockItems[stockIndex].stock - item.quantity;
      console.log("Calculated new stock:", newStock);

      // Update using findByIdAndUpdate
      const updatedProduct = await productModel.findByIdAndUpdate(
        item._id,
        {
          $set: {
            [`stockItems.${stockIndex}.stock`]: newStock,
          },
        },
        { new: true }
      );

      console.log("After update - stockItems:", updatedProduct.stockItems);

      // Verify the update with a separate query
      const verifyProduct = await productModel.findById(item._id);
      console.log("Verification query - stockItems:", verifyProduct.stockItems);

      // If stock is 0, remove that item
      if (newStock <= 0) {
        await productModel.findByIdAndUpdate(item._id, {
          $pull: {
            stockItems: { size: item.size, color: item.colors[0] },
          },
        });
      }
    }

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod,
      payment: paymentMethod === "QR Code",
      paymentProof,
      status: "รอดำเนินการ",
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const confirmQRPayment = async (req, res) => {
  try {
    // โค้ดสำหรับยืนยันการชำระเงิน QR
    res.json({ success: true, message: "QR payment confirmed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Placing orders using QR Code Method
const placeOrderQRCode = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "QR Code",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    res.json({
      success: true,
      orderId: newOrder._id,
      message: "Order placed. Please complete the payment using QR Code.",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Verify QR Code Payment
const verifyQRCodePayment = async (req, res) => {
  try {
    const paymentProofPath =
      req.files.paymentProof && req.files.paymentProof[0];
    const { amount } = req.body;

    if (!paymentProofPath) {
      return res.json({
        success: false,
        message: "No payment proof provided.",
      });
    }

    const uploadResponse = await cloudinary.uploader.upload(
      paymentProofPath.path
    );

    if (!uploadResponse) {
      return res.json({
        success: false,
        message: "Failed to upload payment proof.",
      });
    }

    // Here you would typically verify the payment proof
    // For this example, we'll assume the payment is valid if a proof is provided
    res.json({
      success: true,
      message: "Payment verified successfully",
      paymentProofPath: uploadResponse.secure_url,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// All Orders data for Admin Panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// User Order Data For Frontend
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// update order status from Admin Panel
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// QR Code Payment List
const getQRCodePaymentList = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ paymentMethod: "QR Code" })
      .populate("userId", "name")
      .lean();

    console.log(orders);

    const paymentList = await Promise.all(
      orders.map(async (order) => {
        const productNames = order.items.map((item) => {
          return item.name;
        });

        return {
          buyer: order.address.firstName + " " + order.address.lastName,
          productNames: productNames,
          price: order.amount,
          paymentProof: order.paymentProof,
          orderId: order._id,
        };
      })
    );

    res.json({ success: true, paymentList });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  placeOrder,
  placeOrderQRCode,
  verifyQRCodePayment,
  allOrders,
  userOrders,
  updateStatus,
  getQRCodePaymentList,
  deleteOrder,
};
