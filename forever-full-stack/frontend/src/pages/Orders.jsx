import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";

const Orders = () => {
  const { backendUrl, token, getProductsData } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getColorClass = (colorName) => {
    const colorMap = {
      Black: "bg-black",
      White: "bg-white border border-gray-300",
      Gray: "bg-gray-500",
      Navy: "bg-blue-900",
      Red: "bg-red-500",
      Blue: "bg-blue-500",
      Green: "bg-green-500",
      Yellow: "bg-yellow-400",
      Purple: "bg-purple-500",
      Pink: "bg-pink-500",
      Orange: "bg-orange-500",
      Brown: "bg-amber-800",
      Beige: "bg-[#F5F5DC]",
    };
    return colorMap[colorName] || "bg-gray-200";
  };

  const updateOrderStatus = async (orderId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/update-status`,
        { orderId, status: "ได้รับสินค้าแล้ว" },
        { headers: { token } }
      );
      if (response.data.success) {
        loadOrderData();
        setShowTrackingModal(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  useEffect(() => {
    getProductsData();
  }, []);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <p className="text-gray-500">ประวัติการสั่งซื้อ</p>
      </div>

      <div>
        {orders.map((order, index) => (
          <div key={index} className="py-4 border-t border-b text-gray-700">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm">
                วันที่สั่งซื้อ:{" "}
                <span className="text-gray-400">
                  {new Date(order.date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
              <div className="flex items-center gap-4">
                <p className="text-sm">
                  การชำระเงิน:{" "}
                  <span className="text-gray-400">
                    {order.paymentMethod === "QR Code"
                      ? "โอนเงิน"
                      : order.paymentMethod}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="text-sm">{order.status}</p>
                </div>
              </div>
            </div>

            {/* แสดงรายการสินค้าในออเดอร์ */}
            <div className="space-y-4">
              {order.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-start gap-6 text-sm">
                  <img className="w-16 sm:w-20" src={item.image[0]} alt="" />
                  <div className="flex-1">
                    <p className="sm:text-base font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      ผู้ขาย: {item.owner?.name || "ไม่ระบุ"}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-base text-gray-700">
                      <p>฿{item.price}</p>
                      <p>จำนวน: {item.quantity}</p>
                      <p>ไซส์: {item.size}</p>
                      <div className="flex items-center gap-1">
                        <span>สี:</span>
                        {item.colors.map((color, colorIdx) => (
                          <div
                            key={colorIdx}
                            className={`w-4 h-4 rounded-full ${getColorClass(
                              color
                            )}`}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* แสดงราคารวมและปุ่มติดตามพัสดุ */}
            <div className="mt-4 flex justify-between items-center border-t pt-4">
              <p className="font-medium">ยอดรวม: ฿{order.amount}</p>
              <button
                onClick={() => {
                  setSelectedOrder(order);
                  setShowTrackingModal(true);
                }}
                className="border px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-50"
              >
                ติดตามพัสดุ
              </button>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            ไม่มีประวัติการสั่งซื้อ
          </div>
        )}
      </div>

      {showTrackingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">ติดตามสถานะพัสดุ</h3>
              <button
                onClick={() => setShowTrackingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 border-b pb-4">
                  <img
                    src={item.image[0]}
                    alt=""
                    className="w-24 h-24 object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-600">฿{item.price}</p>
                    <p className="text-gray-600">
                      สถานะ: {selectedOrder.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {selectedOrder.status !== "ได้รับสินค้าแล้ว" && (
              <button
                onClick={() => updateOrderStatus(selectedOrder._id)}
                className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
              >
                ยืนยันการรับสินค้า
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
