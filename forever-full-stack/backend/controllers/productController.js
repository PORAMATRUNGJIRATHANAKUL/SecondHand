import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

// ฟังก์ชันเพิ่มสินค้า
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      colors,
      bestseller,
      stockItems,
    } = req.body;

    const owner = req.userId;

    // ดึงข้อมูลรูปภาพ
    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4]
      .flat()
      .filter((item) => item !== undefined);

    // อัพโหลดรูปภาพไปยัง Cloudinary
    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
          timestamp: Math.round(Date.now() / 1000),
        });
        return result.secure_url;
      })
    );

    // สร้างข้อมูลสินค้า
    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      sizes: JSON.parse(sizes),
      colors: JSON.parse(colors),
      image: imagesUrl,
      date: Date.now(),
      stockItems: JSON.parse(stockItems),
      owner,
    };

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "เพิ่มสินค้าสำเร็จ" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ดึงสินค้าตามเจ้าของ
const getProductsByOwner = async (req, res) => {
  try {
    const userId = req.userId;

    let products = await productModel.find({ owner: userId }).populate({
      path: "owner",
      select: "name email profileImage",
    });

    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "ไม่สามารถดึงข้อมูลสินค้าได้" });
  }
};

// ดึงสินค้าทั้งหมด
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({}).populate({
      path: "owner",
      select: "name email profileImage",
    });
    res.json({ success: true, products });
  } catch (error) {
    res.json({ success: false, message: "ไม่สามารถดึงข้อมูลสินค้าได้" });
  }
};

// ลบสินค้า
const removeProduct = async (req, res) => {
  try {
    const userId = req.userId;
    const productId = req.body.id;

    const product = await productModel.findOne({
      _id: productId,
      owner: userId,
    });

    if (!product) {
      return res.status(403).json({
        success: false,
        message: "คุณไม่มีสิทธิ์ลบสินค้านี้หรือไม่พบสินค้า",
      });
    }

    await productModel.findByIdAndDelete(productId);
    res.json({ success: true, message: "ลบสินค้าสำเร็จ" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "เกิดข้อผิดพลาดในการลบสินค้า" });
  }
};

// ลบสินค้าโดยผู้ดูแลระ���บ
const removeProductAdmin = async (req, res) => {
  try {
    const productId = req.body.id;
    await productModel.findByIdAndDelete(productId);
    res.json({ success: true, message: "ลบสินค้าสำเร็จ" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "เกิดข้อผิดพลาดในการลบสินค้า" });
  }
};

// ดึงข้อมูลสินค้าเดี่ยว
const singleProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productModel.findById(productId);

    if (!product) {
      return res.json({ success: false, message: "ไม่พบสินค้า" });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "ไม่สามารถดึงข้อมูลสินค้าได้" });
  }
};

// ดึงสินค้าที่ได้รับการอนุมัติ
const getApprovedProducts = async (req, res) => {
  try {
    const products = await productModel.find({ isApproved: true });
    res.json({ success: true, products });
  } catch (error) {
    res.json({
      success: false,
      message: "ไม่สามารถดึงข้อมูลสินค้าที่อนุมัติได้",
    });
  }
};

// อนุมัติสินค้า
const approveProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    await productModel.findByIdAndUpdate(productId, { isApproved: true });
    res.json({ success: true, message: "อนุมัติสินค้าสำเร็จ" });
  } catch (error) {
    res.json({ success: false, message: "เกิดข้อผิดพลาดในการอนุมัติสินค้า" });
  }
};

export {
  listProducts,
  addProduct,
  removeProduct,
  removeProductAdmin,
  singleProduct,
  approveProduct,
  getProductsByOwner,
  getApprovedProducts,
};
