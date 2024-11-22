const express = require("express");
const router = express.Router();
const {
  createReport,
  getAllReports,
  getReport,
  updateReportStatus,
} = require("../controllers/reportProblemController");
const adminAuth = require("../middleware/adminAuth");
const authUser = require("../middleware/auth");
const upload = require("../middleware/multer");

// Public route - สำหรับผู้ใช้ทั่วไป
router.post("/", authUser, upload.single("problemImage"), createReport); // เพิ่ม upload middleware

// Admin routes - เฉพาะแอดมิน
router.get("/", adminAuth, getAllReports);
router.get("/:id", adminAuth, getReport);
router.patch("/:id/status", adminAuth, updateReportStatus);

module.exports = router;
