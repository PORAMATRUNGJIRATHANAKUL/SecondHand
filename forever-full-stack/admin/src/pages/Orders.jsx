import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token, searchQuery }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showQRProof, setShowQRProof] = useState(false);
  const [showProducts, setShowProducts] = useState(false);

  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }

    try {
      const response = await axios.get(
        backendUrl + "/api/order/shop-qr-orders",
        { headers: { token } }
      );
      if (response.data.success && response.data.orders.length > 0) {
        setOrders(response.data.orders.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
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

  const updateTransferStatus = async (orderId, status) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/transfer-status",
        { orderId, transferredToShop: status },
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(
          orders.map((order) =>
            order._id === orderId
              ? { ...order, transferredToShop: status }
              : order
          )
        );
        toast.success("อัพเดทสถานะการโอนเงินสำเร็จ");
      }
    } catch (error) {
      toast.error("ไม่สามารถอัพเดทสถานะการโอนเงินได้");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase().trim();

    const fullName =
      `${order.address.firstName} ${order.address.lastName}`.toLowerCase();
    if (fullName.includes(searchLower)) return true;

    const hasMatchingItem = order.items.some((item) =>
      item.name.toLowerCase().includes(searchLower)
    );
    if (hasMatchingItem) return true;

    return false;
  });

  const viewQRProof = (order) => {
    setSelectedOrder(order);
    setShowQRProof(true);
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">
        รายการสินค้าของแต่ละร้านค้า
      </h3>
      <div className="space-y-4">
        {filteredOrders.map((order, index) => (
          <div className="bg-white rounded-lg shadow p-4" key={index}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium text-lg">ร้าน: {order.owner.name}</p>
                <p className="text-gray-600">
                  วันที่: {new Date(order.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">฿{order.amount}</p>
                <p className="text-sm text-gray-600">
                  จำนวนรายการ: {order.items.length}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 border-b pb-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>จำนวน: {item.quantity}</span>
                      <span>ไซส์: {item.size}</span>
                      {item.colors && (
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
                      )}
                    </div>
                    <p className="text-sm mt-1">
                      ราคา: ฿{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t">
              <div className="space-y-1">
                <p>วิธีชำระเงิน: {order.paymentMethod}</p>
                <p>สถานะ: {order.payment ? "ชำระแล้ว" : "รอชำระ"}</p>
                {order.paymentMethod === "QR Code" && (
                  <button
                    onClick={() => viewQRProof(order)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    ตรวจสอบการชำระเงิน
                  </button>
                )}
              </div>
              <div className="w-48">
                <p className="mb-1">สถานะการโอนให้ร้านค้า:</p>
                <select
                  value={order.transferredToShop}
                  onChange={(e) =>
                    updateTransferStatus(order._id, e.target.value === "true")
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value={false}>ยังไม่โอน</option>
                  <option value={true}>โอนแล้ว</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            ไม่พบรายการที่ค้นหา
          </div>
        )}
      </div>

      {showQRProof && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded-lg max-w-lg w-full">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">สลิปการโอนเงิน</h2>
              <button
                onClick={() => setShowQRProof(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-center items-center h-[400px]">
                <img
                  src={selectedOrder.paymentProof}
                  alt="สลิปการโอนเงิน"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.target.src = assets.noImage;
                    e.target.onerror = null;
                  }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  วันที่: {new Date(selectedOrder.date).toLocaleDateString()}
                </p>
                <p>จำนวนเงิน: ฿{selectedOrder.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProducts && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">สินค้าในออเดอร์</h2>
            <div className="space-y-4">
              {selectedOrder.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 border-b pb-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p>จำนวน: {item.quantity}</p>
                    <p>ไซส์: {item.size}</p>
                    {item.colors && (
                      <div className="flex items-center gap-1 mt-1">
                        <span>สี:</span>
                        <div className="flex gap-1">
                          {item.colors.map((color, colorIdx) => (
                            <div
                              key={colorIdx}
                              className={`w-5 h-5 rounded-full ${getColorClass(
                                color
                              )}`}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="mt-1">ราคา: ฿{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowProducts(false)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
