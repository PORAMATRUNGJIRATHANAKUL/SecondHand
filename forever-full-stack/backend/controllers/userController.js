import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const getUserProfile = async (req, res) => {
  const { userId } = req.body;
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
    const { name, userId } = req.body;

    const user = await userModel.findByIdAndUpdate(userId, { name });
    user.save();
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  loginUser,
  registerUser,
  adminLogin,
  updateProfileImage,
  updateUserProfile,
  getUserProfile,
};
