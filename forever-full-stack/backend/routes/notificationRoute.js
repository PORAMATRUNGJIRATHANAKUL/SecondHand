import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getUserNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

// เปลี่ยนการใช้ verifyToken เป็น middleware
router.use(verifyToken);

router.get("/", getUserNotifications);
router.post("/create", createNotification);
router.put("/read/:notificationId", markAsRead);
router.put("/read-all", markAllAsRead);

export default router;
