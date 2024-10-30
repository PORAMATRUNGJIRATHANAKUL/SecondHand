import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

const NotificationList = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ดึงข้อมูลการแจ้งเตือน
  const fetchNotifications = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${backendUrl}/api/notifications`, {
        headers: { token },
        timeout: 5000, // เพิ่ม timeout
      });

      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(
          response.data.notifications.filter((n) => !n.isRead).length
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "ไม่สาม��รถดึงข้อมูลการแจ้งเตือนได้";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // อ่านการแจ้งเตือน
  const handleReadNotification = async (notificationId) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/notifications/read/${notificationId}`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        fetchNotifications();
      }
    } catch (error) {
      toast.error("ไม่สามารถอ่านการแจ้งเตือนได้");
    }
  };

  // อ่านการแจ้งเตือนทั้งหมด
  const handleReadAllNotifications = async () => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/notifications/read-all`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        fetchNotifications();
        toast.success("อ่านการแจ้งเตือนทั้งหมดแล้ว");
      }
    } catch (error) {
      toast.error("ไม่สามารถอ่านการแจ้งเตือนทั้งหมดได้");
    }
  };

  // อัพเดทการแจ้งเตือนทุก 30 วินาที
  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // แสดงผลตามสถานะ loading และ error
  if (isLoading && notifications.length === 0) {
    return <div className="text-center py-4">กำลังโหลด...</div>;
  }

  if (error && notifications.length === 0) {
    return (
      <div className="text-center py-4 text-red-500">
        เกิดข้อผิดพลาด: {error}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* แสดงจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน */}
      {unreadCount > 0 && (
        <div className="absolute top-0 right-0 -mt-1 -mr-1">
          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        </div>
      )}

      {/* แสดงรายการแจ้งเตือน */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          <>
            <div className="flex justify-between items-center p-3 border-b">
              <h3 className="font-medium">การแจ้งเตือน</h3>
              <button
                onClick={handleReadAllNotifications}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                อ่านทั้งหมด
              </button>
            </div>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onRead={handleReadNotification}
              />
            ))}
          </>
        ) : (
          <div className="p-4 text-center text-gray-500">ไม่มีการแจ้งเตือน</div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
