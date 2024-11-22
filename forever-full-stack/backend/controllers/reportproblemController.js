const ReportProblem = require("../models/reportProblemModel");

// สร้างรายงานปัญหาใหม่
const createReport = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);

    const report = await ReportProblem.create({
      ...req.body,
      user: userId,
      reporterName: user.name,
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ดึงข้อมูลรายงานทั้งหมด
const getAllReports = async (req, res) => {
  try {
    const reports = await ReportProblem.find({}).sort({ reportedAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ดึงข้อมูลรายงานเดี่ยว
const getReport = async (req, res) => {
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
const updateReportStatus = async (req, res) => {
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

module.exports = {
  createReport,
  getAllReports,
  getReport,
  updateReportStatus,
};
