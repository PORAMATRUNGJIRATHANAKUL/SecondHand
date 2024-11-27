import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";
import productModel from "../models/productModel.js";
import userOrderModel from "../models/userOrderModel.js";
// global variables
const currency = "thb";
const deliveryCharge = 10;

const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.userId;

    console.log("รหัสออเดอร์:", orderId, "รหัสผู้ใช้:", userId);

    const result = await orderModel.findOneAndDelete({
      _id: orderId,
      "items.owner._id": userId,
    });

    if (result) {
      res.json({
        success: true,
        message: "ลบออเดอร์สำเร็จ",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "ไม่พบออเดอร์ หรือคุณไม่มีสิทธิ์ลบออเดอร์นี้",
      });
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการลบออเดอร์:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบออเดอร์",
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
        throw new Error(`ไม่พบสินค้ารหัส: ${item._id}`);
      }

      // Find the specific size and color combination
      const stockIndex = product.stockItems.findIndex(
        (s) => s.size === item.size && s.color === item.colors[0]
      );

      if (stockIndex === -1) {
        throw new Error(`ไม่พบไซส์ ${item.size} และสี ${item.colors[0]}`);
      }

      console.log(
        "จำนวนสต็อกก่อนอัพเดท:",
        product.stockItems[stockIndex].stock
      );
      const newStock = product.stockItems[stockIndex].stock - item.quantity;
      console.log("จำนวนสต็อกใหม่:", newStock);

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

      console.log("สต็อกหลังอัพเดท:", updatedProduct.stockItems);

      // Verify the update with a separate query
      const verifyProduct = await productModel.findById(item._id);
      console.log("ยืนยันจำนวนสต็อก:", verifyProduct.stockItems);

      // If stock is 0, remove that item
      if (newStock <= 0) {
        await productModel.findByIdAndUpdate(item._id, {
          $pull: {
            stockItems: { size: item.size, color: item.colors[0] },
          },
        });
      }
    }

    const userOrderItems = items.map((item) => {
      return {
        ...item,
        status: "รอดำเนินการ",
      };
    });

    const userOrderData = {
      userId,
      items: userOrderItems,
      amount,
      address,
      paymentMethod,
      date: Date.now(),
    };

    const newUserOrder = new userOrderModel(userOrderData);
    await newUserOrder.save();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      const shopOrderData = {
        userId: item.owner._id,
        userOrderId: newUserOrder._id,
        items: [item],
        address,
        amount: item.price * item.quantity,
        paymentMethod,
        payment: paymentMethod === "QR Code",
        paymentProof,
        status: "รอดำเนินการ",
        date: Date.now(),
      };

      const newOrder = new orderModel(shopOrderData);
      await newOrder.save();
    }

    await userModel.findByIdAndUpdate(userId, { cartData: [] });

    res.json({ success: true, message: "สร้างออเดอร์สำเร็จ" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const confirmQRPayment = async (req, res) => {
  try {
    // โค้ดสำหรับยืนยันกาชำระเงิน QR
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
    const orders = await userOrderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// update order status from Admin Panel
const updateStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId, status, payment, trackingNumber, shippingProvider } =
      req.body;

    const updateData = {
      status,
      ...(payment !== undefined && { payment }),
      ...(trackingNumber && { trackingNumber }),
      ...(shippingProvider && { shippingProvider }),
    };

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );

    const userOrder = await userOrderModel.findById(updatedOrder.userOrderId);

    const updatedItems = userOrder.items.map((item) => {
      if (item.owner._id.toString() === userId) {
        return { ...item, status };
      }
      return item;
    });

    userOrder.items = updatedItems;

    await userOrder.save();

    res.json({
      success: true,
      message: "อัพเดทข้อมูลสำเร็จ",
      order: updatedOrder,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "เกิดข้อผิดพลาดในการอัพเดทส้อมูล" });
  }
};

// QR Code Payment List
const getQRCodePaymentList = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await orderModel
      .find({
        "items.owner._id": userId,
        paymentMethod: "QR Code",
      })
      .populate("userId", "name")
      .lean();

    const paymentList = await Promise.all(
      orders.map(async (order) => {
        const productNames = order.items.map((item) => {
          return item.name;
        });

        const buyer = await userModel.findById(order.userId);

        return {
          // buyer: order.address.firstName + " " + order.address.lastName,
          buyer: buyer.name,
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

// เพิ่มฟังก์ชันใหม่ แก้ในนี้
const getShopOrdersByUserId = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await orderModel
      .find({
        "items.owner._id": userId,
      })
      .populate({
        path: "items.product",
        select: "name image price",
      })
      .populate({
        path: "userId",
        select: "name email profileImage",
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// เพิ่มฟังก์ชันใหม่สำหรับอัพเดทข้อมูลการจัดส่ง
const updateShippingInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId, trackingNumber, shippingProvider } = req.body;

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      {
        trackingNumber,
        shippingProvider,
        status: "จัดส่งแล้ว", // อัพเดทสถานะเป็นจัดส่งแล้วอัตโนมัติ
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบออเดอร์ที่ระบุ",
      });
    }

    const userOrder = await userOrderModel.findById(updatedOrder.userOrderId);

    const updatedItems = userOrder.items.map((item) => {
      if (item.owner._id.toString() === userId) {
        return {
          ...item,
          status: "จัดส่งแล้ว",
          trackingNumber,
          shippingProvider,
        };
      }
      return item;
    });

    userOrder.items = updatedItems;
    await userOrder.save();

    res.json({
      success: true,
      message: "อัพเดทข้อมูลการจัดส่งสำเร็จ",
      order: updatedOrder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัพเดทข้อมูลการจัดส่ง",
    });
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
  getShopOrdersByUserId,
  updateShippingInfo,
};
