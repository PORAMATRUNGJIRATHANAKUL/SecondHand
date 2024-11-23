import ReportProblem from "../models/reportProblemModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

// สร้างรายงานปัญหาใหม่
export const createReport = async (req, res) => {
  try {
    const problemImage = req.files.problemImage && req.files.problemImage[0];

    const uploadResponse = await cloudinary.uploader.upload(problemImage.path);

    if (!uploadResponse) {
      return res.json({
        success: false,
        message: "ไม่สามารถอัพโหลดรูปภาพได้",
      });
    }

    const userId = req.userId;
    const user = await User.findById(userId);

    const report = await ReportProblem.create({
      ...req.body,
      user: userId,
      reporterName: user.name,
      problemImage: uploadResponse.secure_url,
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ดึงข้อมูลรายงานทั้งหมด
export const getAllReports = async (req, res) => {
  try {
    const reports = await ReportProblem.find({})
      .populate("user", "name")
      .sort({ reportedAt: -1 });
    res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ดึงข้อมูลรายงานเดี่ยว
export const getReport = async (req, res) => {
  try {
    const report = await ReportProblem.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: "ไม่พบรายงานนี้" });
    }
    res.status(200).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// อัพเดทสถานะรายงาน
export const updateReportStatus = async (req, res) => {
  try {
    const report = await ReportProblem.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ error: "ไม่พบรายงานนี้" });
    }
    res.status(200).json({ success: true, message: "อัพเดทสถานะรายงานสำเร็จ" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ลบรายงาน
export const deleteReport = async (req, res) => {
  try {
    await ReportProblem.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "ลบรายงานสำเร็จ" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
