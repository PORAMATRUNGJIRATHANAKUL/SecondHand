import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

// เพิ่มสินค้าลงตะกร้า
const addToCart = async (req, res) => {
  try {
    const { productId, size, color, quantity } = req.body;

    // ค้นหาสินค้าเพื่อตรวจสอบสต็อก
    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "ไม่พบสินค้า" });
    }

    // ค้นหาสต็อกตามไซส์และสีที่เลือก
    const stockItem = product.stockItems.find(
      (item) => item.size === size && item.color === color
    );

    if (!stockItem) {
      return res.json({
        success: false,
        message: "ไม่มีสินค้าในไซส์และสีที่เลือก",
      });
    }

    if (stockItem.stock < quantity) {
      return res.json({
        success: false,
        message: "สินค้าในสต็อกไม่เพียงพอ",
      });
    }

    // ค้นหาหรือสร้างตะกร้าสินค้าสำหรับผู้ใช้
    let cart = await userModel.findOne({ userId });
    if (!cart) {
      cart = new userModel({ userId, cartData: [] });
    }

    // เพิ่มหรืออัพเดทสินค้าในตะกร้า
    const cartItemIndex = cart.cartData.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (cartItemIndex > -1) {
      cart.cartData[cartItemIndex].quantity += quantity;
    } else {
      cart.cartData.push({ productId, size, color, quantity });
    }

    await cart.save();

    res.json({ success: true, message: "เพิ่มสินค้าลงตะกร้าเรียบร้อย" });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า",
    });
  }
};

// อัพเดทตะกร้าสินค้า
const updateCart = async (req, res) => {
  try {
    const { userId, itemId, size, color, quantity } = req.body;

    const userData = await userModel.findById(userId);
    let cartData = await userData.cartData;

    cartData[itemId][size][color] = quantity;

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "อัพเดทตะกร้าสินค้าเรียบร้อย" });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัพเดทตะกร้าสินค้า",
    });
  }
};

// ดึงข้อมูลตะกร้าสินค้าของผู้ใช้
const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId);
    let cartData = await userData.cartData;

    res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้าสินค้า",
    });
  }
};

export { addToCart, updateCart, getUserCart };
