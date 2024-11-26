import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import addressModel from "../models/addressModel.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const getUserProfile = async (req, res) => {
  const userId = req.userId;
  const user = await userModel.findById(userId, { password: 0, __v: 0 });
  res.json({ success: true, user });
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "ไม่พบบัญชีผู้ใช้นี้" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
  }
};

// Route for user register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // checking user already exists or not
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "อีเมลนี้ถูกใช้งานแล้ว" });
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "กรุณากรอกอีเมลให้ถูกต้อง",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      displayName: name,
    });

    const user = await newUser.save();

    const token = createToken(user._id);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
  }
};

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบสำหรับผู้ดูแล",
    });
  }
};

// Route for updating user profile image
const updateProfileImage = async (req, res) => {
  try {
    const profileImage = req.files.profileImage && req.files.profileImage[0];

    // get userid from formData
    const userId = req.body.userId;

    const uploadResponse = await cloudinary.uploader.upload(profileImage.path);

    if (!uploadResponse) {
      return res.json({ success: false, message: "ไม่สามารถอัพโหลดรูปภาพได้" });
    }

    const user = await userModel.findByIdAndUpdate(userId, {
      profileImage: uploadResponse.secure_url,
    });
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, displayName } = req.body;

    console.log(name, displayName);

    if (!name || !displayName) {
      return res
        .status(400)
        .json({ success: false, message: "กรุณาระบุชื่อและชื่อร้าน" });
    }

    const user = await userModel.findByIdAndUpdate(userId, {
      name,
      displayName,
    });
    user.save();
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัพเดทข้อมูลผู้ใช้",
    });
  }
};

// เพิ่มที่อยู่ใหม่
const addAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const addressData = { ...req.body, userId };

    // ถ้าเป็นที่อยู่แรก ให้เป็น default
    const existingAddresses = await addressModel.countDocuments({ userId });
    if (existingAddresses === 0) {
      addressData.isDefault = true;
    }

    const newAddress = new addressModel(addressData);
    await newAddress.save();

    res.json({ success: true, address: newAddress });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเพิ่มที่อยู่",
    });
  }
};

// แก้ไขที่อยู่
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.userId;

    const address = await addressModel.findOneAndUpdate(
      { _id: addressId, userId },
      req.body,
      { new: true }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบที่อยู่ที่ต้องการแก้ไข",
      });
    }

    res.json({ success: true, address });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการแก้ไขที่อยู่",
    });
  }
};

// ลบที่อยู่
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.userId;

    const address = await addressModel.findOneAndDelete({
      _id: addressId,
      userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบที่อยู่ที่ต้องการลบ",
      });
    }

    // ถ้าลบที่อยู่ default ให้กำหนดที่อยู่แรกเป็น default แทน
    if (address.isDefault) {
      const firstAddress = await addressModel.findOne({ userId });
      if (firstAddress) {
        firstAddress.isDefault = true;
        await firstAddress.save();
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบที่อยู่",
    });
  }
};

// ดึงที่อยู่ทั้งหมดของผู้ใช้
const getAddresses = async (req, res) => {
  try {
    const userId = req.userId;
    const addresses = await addressModel.find({ userId });
    res.json({ success: true, addresses });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลที่อยู่",
    });
  }
};

// กำหนดที่อยู่เริ่มต้น
const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.userId;

    const address = await addressModel.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบที่อยู่ที่ต้องการกำหนดเป็นค่าเริ่มต้น",
      });
    }

    address.isDefault = true;
    await address.save(); // This will trigger the pre-save middleware

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการกำหนดที่อยู่เริ่มต้น",
    });
  }
};

export {
  loginUser,
  registerUser,
  adminLogin,
  updateProfileImage,
  updateUserProfile,
  getUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
};
