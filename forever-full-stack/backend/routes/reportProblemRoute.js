import express from "express";
import {
  createReport,
  getAllReports,
  getReport,
  updateReportStatus,
  deleteReport,
  updateResolutionDetails,
  updateProblemDetails,
} from "../controllers/reportProblemController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Public route - สำหรับผู้ใช้ทั่วไป
router.post(
  "/",
  authUser,
  upload.fields([{ name: "problemImage", maxCount: 1 }]),
  createReport
);

// Admin routes - เฉพาะแอดมิน
router.get("/", adminAuth, getAllReports);
router.get("/:id", adminAuth, getReport);
router.patch("/:id/status", adminAuth, updateReportStatus);
router.patch("/:id/resolution", adminAuth, updateResolutionDetails);
router.patch("/:id/details", adminAuth, updateProblemDetails);
router.delete("/:id", adminAuth, deleteReport);

export default router;
