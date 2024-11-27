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

  return (
    <div>
      <h3>Order Page</h3>
      <div>
        {filteredOrders.map((order, index) => (
          <div
            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
            key={index}
          >
            <img
              className="w-12 cursor-pointer hover:opacity-80"
              src={assets.parcel_icon}
              alt=""
              onClick={() => viewProducts(order)}
            />
            <div>
              {order.items.map((item, index) => (
                <div key={index} className="mb-2">
                  <p className="font-medium">ร้าน: {order.owner.name}</p>
                  <p>สินค้า: {item.name}</p>
                  <p>จำนวน: {item.quantity}</p>
                  <p>ราคา: ฿{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
            <div>
              {order.items.map((item, index) => (
                <p
                  key={index}
                  className="flex items-center gap-2 py-0.5 flex-wrap"
                >
                  <span>{item.name}</span>
                  <span className="text-gray-500">จำนวน {item.quantity}</span>
                  <span className="text-gray-500">ไซส์ {item.size}</span>
                  {item.colors && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">สี</span>
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
                  {index !== order.items.length - 1 && (
                    <span className="text-gray-300">,</span>
                  )}
                </p>
              ))}
            </div>
            <div>
              <p className="text-sm sm:text-[15px]">
                จำนวนรายการ: {order.items.length}
              </p>
              <p className="mt-3">วิธีชำระเงิน: {order.paymentMethod}</p>
              <p>สถานะการชำระเงิน: {order.payment ? "ชำระแล้ว" : "รอชำระ"}</p>
              {order.paymentMethod === "QR Code" && (
                <button
                  onClick={() => viewQRProof(order)}
                  className="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-xs"
                >
                  ตรวจสอบการชำระเงิน
                </button>
              )}
              <p>วันที่: {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <p className="text-sm sm:text-[15px]">฿{order.amount}</p>

            <div className="flex flex-col gap-2">
              <div className="mt-2">
                <p>สถานะการโอนให้ร้านค้า:</p>
                <select
                  value={order.transferredToShop}
                  onChange={(e) =>
                    updateTransferStatus(order._id, e.target.value === "true")
                  }
                  className="mt-1 p-1 border rounded w-full"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">สลิปการโอนเงิน</h2>
            <div className="flex justify-center items-center h-[500px]">
              <img
                src={`${selectedOrder.paymentProof}`}
                alt="QR Code Payment Proof"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowQRProof(false)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded"
              >
                ปิด
              </button>
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
