import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";
import productModel from "../models/productModel.js";
import userOrderModel from "../models/userOrderModel.js";
import contactModel from "../models/contactModel.js";
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
    const { userId, items, amount, paymentMethod, paymentProof } = req.body;

    console.log("Received order data:", {
      paymentMethod,
      paymentProof,
    });

    console.log("Received items:", items);

    // Check stock and get full product data
    const itemsWithFullData = await Promise.all(
      items.map(async (item) => {
        const product = await productModel
          .findById(item.productId)
          .populate("owner", "name email profileImage");

        if (!product) {
          throw new Error(`ไม่พบสินค้ารหัส: ${item.productId}`);
        }

        const stockItem = product.stockItems.find(
          (s) => s.size === item.size && s.color === item.color
        );

        if (!stockItem) {
          throw new Error(
            `ไม่พบสต็อกสินค้า ${product.name} ไซส์ ${item.size} สี ${item.color}`
          );
        }

        if (stockItem.stock < item.quantity) {
          throw new Error(
            `สินค้า ${product.name} มีไม่เพียงพอ (เหลือ ${stockItem.stock} ชิ้น, ต้องการ ${item.quantity} ชิ้น)`
          );
        }

        const shippingCost = product.shippingCost || 0;

        return {
          _id: item.productId,
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image: product.image,
          owner: {
            _id: product.owner._id,
            name: product.owner.name,
            email: product.owner.email,
            profileImage: product.owner.profileImage,
          },
          shippingCost: shippingCost * item.quantity,
          shippingAddress: item.shippingAddress,
          status: "รอดำเนินการ",
        };
      })
    );

    // Update stock for all items
    for (const item of itemsWithFullData) {
      const product = await productModel.findById(item.productId);
      const stockIndex = product.stockItems.findIndex(
        (s) => s.size === item.size && s.color === item.color
      );

      await productModel.findByIdAndUpdate(
        item.productId,
        {
          $set: {
            [`stockItems.${stockIndex}.stock`]:
              product.stockItems[stockIndex].stock - item.quantity,
          },
        },
        { new: true }
      );
    }

    // Group items by shop owner
    const itemsByShop = itemsWithFullData.reduce((acc, item) => {
      const shopId = item.owner._id;
      if (!acc[shopId]) {
        acc[shopId] = [];
      }
      acc[shopId].push({
        ...item,
        shippingCost: item.shippingCost || 0,
        status: "รอดำเนินการ",
      });
      return acc;
    }, {});

    // Create user order
    const userOrderData = {
      userId,
      items: itemsWithFullData,
      amount,
      paymentMethod,
      date: Date.now(),
    };

    const newUserOrder = new userOrderModel(userOrderData);
    await newUserOrder.save();

    // Create shop orders
    for (const [shopId, shopItems] of Object.entries(itemsByShop)) {
      const shopTotal = shopItems.reduce(
        (sum, item) => sum + (item.price * item.quantity + item.shippingCost),
        0
      );

      const shopOrderData = {
        userId,
        userOrderId: newUserOrder._id,
        items: shopItems,
        amount: shopTotal,
        paymentMethod,
        payment: paymentMethod === "QR Code",
        paymentProof,
        status: "รอดำเนินการ",
        date: Date.now(),
      };

      console.log("Creating shop order with data:", shopOrderData);

      const newOrder = new orderModel(shopOrderData);
      await newOrder.save();
    }

    // Clear user's cart
    await userModel.findByIdAndUpdate(userId, { cartData: [] });

    res.json({
      success: true,
      message: "สร้างออเดอร์สำเร็จ",
      orderId: newUserOrder._id,
    });
  } catch (error) {
    console.error("Error in placeOrder:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
      transferredToShop: false,
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
    const { orderId, itemId, size, status, confirmedByCustomer } = req.body;
    const userId = req.userId;

    console.log("Received update request:", {
      orderId,
      itemId,
      size,
      status,
      confirmedByCustomer,
      userId,
    });

    if (!orderId || !itemId || !size || !status) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุข้อมูลให้ครบถ้วน",
        received: { orderId, itemId, size, status },
      });
    }

    // Update userOrder using findOneAndUpdate
    const updatedUserOrder = await userOrderModel.findOneAndUpdate(
      { _id: orderId, "items._id": itemId, "items.size": size },
      {
        $set: {
          "items.$.status": status,
          "items.$.confirmedByCustomer": confirmedByCustomer || false,
        },
      },
      { new: true }
    );

    if (!updatedUserOrder) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบออเดอร์ที่ระบุ",
        orderId,
      });
    }

    // Update shopOrder using findOneAndUpdate
    const updatedShopOrder = await orderModel.findOneAndUpdate(
      { userOrderId: orderId, "items._id": itemId, "items.size": size },
      {
        $set: {
          "items.$.status": status,
          "items.$.confirmedByCustomer": confirmedByCustomer || false,
        },
      },
      { new: true }
    );

    console.log("Update completed successfully");

    res.json({
      success: true,
      message: "อัพเดทสถานะสำเร็จ",
      userOrder: updatedUserOrder,
      shopOrder: updatedShopOrder,
    });
  } catch (error) {
    console.error("Error in updateStatus:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัพเดทสถานะ",
      error: error.message,
    });
  }
};

const transferToShop = async (req, res) => {
  try {
    const { orderId, transferredToShop } = req.body;

    const updatedOrder = await orderModel.findById(orderId);

    updatedOrder.transferredToShop = transferredToShop;

    await updatedOrder.save();

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// QR Code Payment Orders
const getQRCodePaymentOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await orderModel.find({
      paymentMethod: "QR Code",
    });

    const paymentList = await Promise.all(
      orders.map(async (order) => {
        const owner = await userModel.findById(
          order.userId,
          "name profileImage displayName"
        );

        return { ...order._doc, owner };
      })
    );

    res.json({ success: true, orders: paymentList });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
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
        path: "userId",
        select: "name email profileImage",
      })
      .populate({
        path: "userOrderId",
        select: "items status",
      })
      .sort({ date: -1 });

    const formattedOrders = await Promise.all(
      orders.map(async (order) => {
        const orderObj = order.toObject();

        const contact = await contactModel
          .findOne({
            orderId: order._id,
            shopId: userId,
          })
          .sort({ createdAt: -1 });

        return {
          ...orderObj,
          items: orderObj.items
            .filter((item) => item.owner._id.toString() === userId.toString())
            .map((item) => ({
              ...item,
              image: Array.isArray(item.image) ? item.image : [item.image],
            })),
          contact: contact || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// เพิ่มฟังก์ชันใหม่สำหรับอัพเดทข้อมูลการจัดส่ง
const updateShippingInfo = async (req, res) => {
  try {
    const { orderId, itemId, trackingNumber, shippingProvider, size } =
      req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!orderId || !trackingNumber || !shippingProvider) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุข้อมูลให้ครบถ้วน",
      });
    }

    // อัพเดทข้อมูลใน orderModel
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบออเดอร์ที่ระบุ",
      });
    }

    // ถัพเดทเฉพาะ item ที่ตรงกับ itemId และ size
    const updatedItems = order.items.map((item) => {
      if (item._id.toString() === itemId && item.size === size) {
        return {
          ...item,
          trackingNumber,
          shippingProvider,
          status: "จัดส่งแล้ว",
        };
      }
      return item;
    });

    order.items = updatedItems;
    await order.save();

    // อัพเดทข้อมูลใน userOrderModel ด้วย
    const userOrder = await userOrderModel.findById(order.userOrderId);

    if (!userOrder) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลการสั่งซื้อของผู้ใช้",
      });
    }

    const updatedUserOrderItems = userOrder.items.map((item) => {
      if (item._id.toString() === itemId && item.size === size) {
        return {
          ...item,
          trackingNumber,
          shippingProvider,
          status: "จัดส่งแล้ว",
        };
      }
      return item;
    });

    userOrder.items = updatedUserOrderItems;
    await userOrder.save();

    return res.status(200).json({
      success: true,
      message: "อัพเดทข้อมูลการจัดส่งสำเร็จ",
      order: order,
    });
  } catch (error) {
    console.error("Error in updateShippingInfo:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัพเดทข้อมูลการจัดส่ง",
      error: error.message,
    });
  }
};

const contactShop = async (req, res) => {
  try {
    const { description, phone, shopId, orderId, productId } = req.body;
    const userId = req.userId;

    // Handle file uploads
    const images = req.files["images"]
      ? await Promise.all(
          req.files["images"].map((file) =>
            cloudinary.uploader.upload(file.path)
          )
        )
      : [];

    const video = req.files["video"]
      ? await cloudinary.uploader.upload(req.files["video"][0].path, {
          resource_type: "video",
        })
      : null;

    // Create contact record (you'll need to create a contactModel)
    const contactData = {
      userId,
      shopId,
      orderId,
      productId,
      description,
      phone,
      images: images.map((img) => img.secure_url),
      video: video?.secure_url,
      status: "pending",
      createdAt: new Date(),
    };

    // Save to database (you'll need to create this model)
    const contact = await contactModel.create(contactData);

    res.status(200).json({
      success: true,
      message: "ส่งข้อมูลการติดต่อเรียบร้อยแล้ว",
      contact,
    });
  } catch (error) {
    console.error("Error in contactShop:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการส่งข้อมูลการติดต่อ",
      error: error.message,
    });
  }
};

const getCustomerIssues = async (req, res) => {
  try {
    const userId = req.userId;
    const issues = await contactModel
      .find({ shopId: userId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      issues,
    });
  } catch (error) {
    console.error("Error fetching customer issues:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลปัญหาของลูกค้า",
    });
  }
};

const updateIssueStatus = async (req, res) => {
  try {
    const { issueId, status } = req.body;
    const userId = req.userId;

    const issue = await contactModel.findOneAndUpdate(
      { _id: issueId, shopId: userId },
      { status },
      { new: true }
    );

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลปัญหาที่ระบุ",
      });
    }

    res.json({
      success: true,
      message: "อัพเดทสถานะสำเร็จ",
      issue,
    });
  } catch (error) {
    console.error("Error updating issue status:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัพเดทสถานะ",
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
  getQRCodePaymentOrders,
  getQRCodePaymentList,
  deleteOrder,
  getShopOrdersByUserId,
  updateShippingInfo,
  transferToShop,
  contactShop,
  getCustomerIssues,
  updateIssueStatus,
};
