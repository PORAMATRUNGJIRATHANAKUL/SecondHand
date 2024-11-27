import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";

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

  const updateOrderStatus = async (orderId, shopId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        {
          orderId,
          shopId,
          status: "ได้รับสินค้าแล้ว",
          confirmedByCustomer: true,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("ยืนยันการรับสินค้าสำเร็จ");
        setShowTrackingModal(false);
        loadOrderData();
      } else {
        toast.error("ไม่สามารถอัพเดทสถานะได้");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(
        error.response?.data?.message || "เกิดข้อผิดพลาดในการอัพเดทสถานะ"
      );
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
              </div>
            </div>

            {/* แสดงรายการสินค้าในออเดอร์ */}
            <div className="space-y-4">
              {order.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex justify-end items-start gap-6 text-sm"
                >
                  <div className="flex-1 flex">
                    <img className="w-16 sm:w-20" src={item.image[0]} alt="" />
                    <div className="ml-4 sm:ml-6">
                      <p className="sm:text-base font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        ร้านค้า: {item.owner?.name || "ไม่ระบุ"}
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
                      {item.trackingNumber && item.shippingProvider && (
                        <div className="text-sm space-y-1 mt-2">
                          <p>
                            <span className="font-medium">เลขพัสดุ:</span>{" "}
                            {item.trackingNumber}
                          </p>
                          <p>
                            <span className="font-medium">ขนส่งโดย:</span>{" "}
                            {item.shippingProvider}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <p className="text-sm">{item.status}</p>
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
                รายละเอียดสินค้า
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
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-semibold">รายละเอียดสินค้า</h3>
              <button
                onClick={() => setShowTrackingModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Items List */}
            <div className="space-y-6">
              {selectedOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-6 border-b pb-6 last:border-b-0"
                >
                  {/* Product Image */}
                  <img
                    src={item.image[0]}
                    alt={item.name}
                    className="w-32 h-32 object-cover rounded-lg shadow-sm"
                  />

                  {/* Product Details */}
                  <div className="flex-1 space-y-3">
                    <h4 className="text-lg font-medium">{item.name}</h4>

                    {/* Shop Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {item.owner?.profileImage ? (
                        <img
                          src={item.owner.profileImage}
                          alt="Profile"
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-300"></div>
                      )}
                      <span className="font-medium">
                        {item.owner?.name || "ไม่ระบุชื่อร้าน"}
                      </span>
                    </div>

                    {/* Status and Tracking */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        สถานะ: <span className="text-black">{item.status}</span>
                      </p>
                      {item.trackingNumber && item.shippingProvider && (
                        <div className="text-sm space-y-1">
                          <p>
                            <span className="font-medium">เลขพัสดุ:</span>{" "}
                            {item.trackingNumber}
                          </p>
                          <p>
                            <span className="font-medium">ขนส่งโดย:</span>{" "}
                            {item.shippingProvider}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Product Specifications */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <p className="flex items-center gap-1">
                        <span className="font-medium">จำนวน:</span>{" "}
                        {item.quantity} ชิ้น
                      </p>
                      <p className="flex items-center gap-1">
                        <span className="font-medium">ไซส์:</span> {item.size}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">สี:</span>
                        <div className="flex gap-1">
                          {item.colors.map((color, colorIdx) => (
                            <div
                              key={colorIdx}
                              className={`w-5 h-5 rounded-full ${getColorClass(
                                color
                              )} border border-gray-200`}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-lg font-semibold text-black mt-2">
                      ฿{(item.price * item.quantity + 50).toLocaleString()}
                    </p>

                    {/* เพิ่มปุ่มยืนยันการรับสินค้า */}
                    {item.status !== "ได้รับสินค้าแล้ว" &&
                      item.trackingNumber && (
                        <button
                          onClick={() =>
                            updateOrderStatus(selectedOrder._id, item.owner._id)
                          }
                          className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                          ยืนยันการรับสินค้า
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
