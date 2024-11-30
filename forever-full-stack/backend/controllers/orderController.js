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
    const { userId, items, amount, paymentMethod, paymentProof, address } =
      req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุที่อยู่จัดส่ง",
      });
    }

    // Validate address has all required fields
    const requiredFields = [
      "name",
      "addressLine1",
      "district",
      "province",
      "postalCode",
      "phoneNumber",
    ];
    for (const field of requiredFields) {
      if (!address[field]) {
        return res.status(400).json({
          success: false,
          message: `กรุณาระบุ ${field} ในที่อยู่จัดส่ง`,
        });
      }
    }

    // Check stock and get full product data
    const itemsWithFullData = await Promise.all(
      items.map(async (item) => {
        const product = await productModel
          .findById(item._id)
          .populate("owner", "name email profileImage");
        if (!product) {
          throw new Error(`ไม่พบสินค้ารหัส: ${item._id}`);
        }

        const stockItem = product.stockItems.find(
          (s) => s.size === item.size && s.color === item.colors[0]
        );

        if (!stockItem) {
          throw new Error(
            `ไม่พบสต็อกสินค้า ${product.name} ไซส์ ${item.size} สี ${item.colors[0]}`
          );
        }

        if (stockItem.stock < item.quantity) {
          throw new Error(
            `สินค้า ${product.name} มีไม่เพียงพอ (เหลือ ${stockItem.stock} ชิ้น, ต้องการ ${item.quantity} ชิ้น)`
          );
        }

        // ดึงค่าจัดส่งจากข้อมูลสินค้า
        const shippingCost = product.shippingCost || 0;

        return {
          ...item,
          name: product.name,
          price: product.price,
          image: product.image,
          owner: {
            _id: product.owner._id,
            name: product.owner.name,
            email: product.owner.email,
            profileImage: product.owner.profileImage,
          },
          shippingCost: shippingCost * item.quantity, // คำนวณค่าจัดส่งตามจำนวนสินค้า
        };
      })
    );

    // Update stock for all items
    for (const item of itemsWithFullData) {
      const product = await productModel.findById(item._id);
      const stockIndex = product.stockItems.findIndex(
        (s) => s.size === item.size && s.color === item.colors[0]
      );

      await productModel.findByIdAndUpdate(
        item._id,
        {
          $set: {
            [`stockItems.${stockIndex}.stock`]:
              product.stockItems[stockIndex].stock - item.quantity,
          },
        },
        { new: true }
      );
    }

    // Group items by shop owner and add shipping address to each item
    const itemsByShop = itemsWithFullData.reduce((acc, item) => {
      const shopId = item.owner._id;
      if (!acc[shopId]) {
        acc[shopId] = [];
      }
      acc[shopId].push({
        ...item,
        shippingCost: item.shippingCost || 0,
        status: "รอดำเนินการ",
        shippingAddress: {
          name: address.name,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || "",
          district: address.district,
          province: address.province,
          postalCode: address.postalCode,
          phoneNumber: address.phoneNumber,
          country: address.country || "ประเทศไทย",
        },
      });
      return acc;
    }, {});

    // Create user order with shipping addresses
    const userOrderItems = itemsWithFullData.map((item) => ({
      ...item,
      status: "รอดำเนินการ",
      shippingCost: item.shippingCost || 0,
      shippingAddress: {
        name: address.name,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || "",
        district: address.district,
        province: address.province,
        postalCode: address.postalCode,
        phoneNumber: address.phoneNumber,
        country: address.country || "ประเทศไทย",
      },
    }));

    const userOrderData = {
      userId,
      items: userOrderItems,
      amount,
      paymentMethod,
      date: Date.now(),
      address: {
        name: address.name,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || "",
        district: address.district,
        province: address.province,
        postalCode: address.postalCode,
        phoneNumber: address.phoneNumber,
        country: address.country || "ประเทศไทย",
      },
    };

    const newUserOrder = new userOrderModel(userOrderData);
    await newUserOrder.save();

    // Create shop orders grouped by shop with shipping addresses
    for (const [shopId, shopItems] of Object.entries(itemsByShop)) {
      // คำนวณยอดรวมโดยรวมค่าจัดส่งของแต่ละชิ้น
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
        address: {
          name: address.name,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || "",
          district: address.district,
          province: address.province,
          postalCode: address.postalCode,
          phoneNumber: address.phoneNumber,
          country: address.country || "ประเทศไทย",
        },
      };

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
    const userId = req.userId;
    const { orderId, status, confirmedByCustomer, shopId } = req.body;

    // คัพเดท userOrder
    const userOrder = await userOrderModel.findById(orderId);
    if (!userOrder) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบออเดอร์ที่ระบุ",
      });
    }

    // อัพเดทสถานะเฉพาะสินค้าของร้านที่ระบุ
    const updatedItems = userOrder.items.map((item) => {
      if (item.owner._id === shopId) {
        return {
          ...item,
          status: status,
        };
      }
      return item;
    });

    userOrder.items = updatedItems;
    await userOrder.save();

    // เพิ่มการอัพเดท orderModel สำหรับร้านค้า
    if (confirmedByCustomer) {
      await orderModel.findOneAndUpdate(
        {
          userOrderId: orderId,
          "items.owner._id": shopId,
        },
        {
          $set: {
            status: status,
            items: updatedItems.filter((item) => item.owner._id === shopId),
          },
        }
      );
    }

    res.json({
      success: true,
      message: "อัพเดทข้อมูลสำเร็จ",
      order: userOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัพเดทข้อมูล",
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

    // จัดรูปแบบข้อมูลให้ตรงกับที่ frontend ต้องการ
    const formattedOrders = orders.map((order) => {
      const orderObj = order.toObject();
      return {
        ...orderObj,
        items: orderObj.items
          .filter((item) => item.owner._id.toString() === userId.toString())
          .map((item) => ({
            ...item,
            image: Array.isArray(item.image) ? item.image : [item.image],
          })),
      };
    });

    res.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Error in getShopOrdersByUserId:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์",
      error: error.message,
    });
  }
};

// เพิ่มฟังก์ชันใหม่สำหรับอัพเดทข้อมูลการจัดส่ง
const updateShippingInfo = async (req, res) => {
  try {
    const { orderId, trackingNumber, shippingProvider } = req.body;
    console.log("Received data:", {
      orderId,
      trackingNumber,
      shippingProvider,
    });

    if (!orderId || !trackingNumber || !shippingProvider) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุข้อมูลให้ครบถ้วน",
      });
    }

    // อัพเดทข้อมูลการจัดส่งในทั้ง order และ userOrder
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบออเดอร์ที่ระบุ",
      });
    }

    // อัพเดทข้อมูลการจัดส่งสำหรับทุก item ในออเดอร์
    order.items = order.items.map((item) => ({
      ...item.toObject(),
      trackingNumber,
      shippingProvider,
      status: "จัดส่งแล้ว",
    }));

    // อัพเดทขถานะหลักของออเดอร์
    order.status = "จัดส่งแล้ว";

    // อัพเดท userOrder ด้วย
    const userOrder = await userOrderModel.findById(order.userOrderId);
    if (userOrder) {
      userOrder.items = userOrder.items.map((item) => {
        if (item.owner._id.toString() === req.userId) {
          return {
            ...item,
            trackingNumber,
            shippingProvider,
            status: "จัดส่งแล้ว",
          };
        }
        return item;
      });
      await userOrder.save();
    }

    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: "อัพเดทข้อมูลการจัดส่งสำเร็จ",
      order: updatedOrder,
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
};
