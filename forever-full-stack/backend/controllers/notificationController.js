import notificationModel from "../models/notificationModel.js";

// ดึงการแจ้งเตือนทั้งหมดของผู้ใช้
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// สร้างการแจ้งเตือนใหม่
export const createNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body;

    const notification = new notificationModel({
      userId,
      message,
      type,
    });

    await notification.save();
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// อ่านการแจ้งเตือน
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await notificationModel.findByIdAndUpdate(notificationId, {
      isRead: true,
    });

    res.json({ success: true, message: "อ่านการแจ้งเตือนแล้ว" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// อ่านการแจ้งเตือนทั้งหมด
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await notificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: "อ่านการแจ้งเตือนทั้งหมดแล้ว" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
