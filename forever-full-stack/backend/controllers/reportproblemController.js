import ReportProblem from "../models/reportProblemModel.js";
import User from "../models/userModel.js";

// สร้างรายงานปัญหาใหม่
export const createReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const report = await ReportProblem.create({
      ...req.body,
      user: userId,
      reporterName: user.name,
      problemImage: req.files.problemImage[0].path,
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ดึงข้อมูลรายงานทั้งหมด
export const getAllReports = async (req, res) => {
  try {
    const reports = await ReportProblem.find({}).sort({ reportedAt: -1 });
    res.status(200).json(reports);
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
    res.status(200).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
