import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";

const Ordershopme = ({ searchQuery }) => {
  const { backendUrl, token } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showQRProof, setShowQRProof] = useState(false);
  const [showProducts, setShowProducts] = useState(false);

  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }

    try {
      const response = await axios.get(backendUrl + "/api/order/my-orders", {
        headers: { token },
      });
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        await fetchAllOrders();
      }
    } catch (error) {
      console.log(error);
      toast.error(response.data.message);
    }
  };

  const viewQRProof = (order) => {
    setSelectedOrder(order);
    setShowQRProof(true);
  };

  const viewProducts = (order) => {
    setSelectedOrder(order);
    setShowProducts(true);
  };

  const deleteOrder = async (orderId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบออเดอร์นี้?")) {
      try {
        const response = await axios.delete(
          `${backendUrl}/api/order/delete/${orderId}`,
          { headers: { token } }
        );

        if (response.data.success) {
          toast.success("ลบออเดอร์สำเร็จ");
          await fetchAllOrders();
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error("ไม่สามารถลบออเดอร์ได้");
      }
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

  const getColorName = (colorName) => {
    const colorNames = {
      Black: "ดำ",
      White: "ขาว",
      Gray: "เทา",
      Navy: "กรมท่า",
      Red: "แดง",
      Blue: "น้ำเงิน",
      Green: "เขียว",
      Yellow: "เหลือง",
      Purple: "ม่วง",
      Pink: "ชมพู",
      Orange: "ส้ม",
      Brown: "น้ำตาล",
      Beige: "เบจ",
    };
    return colorNames[colorName] || colorName;
  };

  return (
    <div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-4">รายการสั่งซื้อลูกค้า</h3>
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-4 relative"
            >
              {/* ส่วนหัวของการ์ด */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <img
                    className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80"
                    src={order.items[0].image[0]}
                    alt="รูปสินค้า"
                    onClick={() => viewProducts(order)}
                  />
                  <div>
                    <p className="font-medium text-lg">
                      {order.address.firstName} {order.address.lastName}
                    </p>
                    <p className="text-gray-600">{order.address.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-semibold">
                    ฿{order.amount.toLocaleString()}
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm("คุณต้องการลบออเดอร์นี้ใช่หรือไม่?")) {
                        deleteOrder(order._id);
                      }
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    title="ลบออเดอร์"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* รายการสินค้า */}
              <div className="mb-4">
                {order.items.map((item, index) => (
                  <p
                    key={index}
                    className="flex items-center gap-2 py-1 flex-wrap"
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500">x{item.quantity}</span>
                    <span className="text-gray-500">ไซส์ {item.size}</span>
                    {item.colors && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">สี:</span>
                        {item.colors.map((color, colorIdx) => (
                          <div
                            key={colorIdx}
                            className={`w-4 h-4 rounded-full ${getColorClass(
                              color
                            )}`}
                            title={getColorName(color)}
                          />
                        ))}
                      </div>
                    )}
                  </p>
                ))}
              </div>

              {/* ข้อมูลการการชำระเงิน */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">ที่อยู่จัดส่ง:</p>
                  <p>{order.address.street}</p>
                  <p>
                    {order.address.city} {order.address.state}{" "}
                    {order.address.country} {order.address.zipcode}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>วันที่สั่งซื้อ:</span>
                    <span>
                      {new Date(order.date).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>วิธีชำระเงิน:</span>
                    <span>
                      {order.paymentMethod === "QR Code"
                        ? "โอนเงิน"
                        : "เก็บเงินปลายทาง"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>สถานะการชำระเงิน:</span>

                    {order.paymentMethod === "QR Code" && (
                      <span>{order.payment ? "ชำระแล้ว" : "รอชำระ"}</span>
                    )}
                    {order.paymentMethod === "ชำระเงินปลายทาง" && (
                      <span>
                        {order.status === "ได้รับสินค้าแล้ว"
                          ? "ชำระแล้ว"
                          : "รอชำระ"}
                      </span>
                    )}
                  </div>
                  {order.paymentMethod === "QR Code" && (
                    <button
                      onClick={() => viewQRProof(order)}
                      className="bg-black  hover:bg-gray-800 text-white px-3 py-1.5 rounded text-sm w-full transition-colors"
                    >
                      ดูสลิป
                    </button>
                  )}
                </div>
              </div>

              {/* สถานะการจัดส่ง */}
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <select
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                    className="w-full p-2 border rounded bg-gray-50 font-medium"
                    disabled={order.status === "ได้รับสินค้าแล้ว"}
                  >
                    <option value="รอดำเนินการ">รอดำเนินการ</option>
                    <option value="รับออเดอร์แล้ว">รับออเดอร์แล้ว</option>
                    <option value="สลิปไม่ถูกต้อง">สลิปไม่ถูกต้อง</option>
                    <option value="กำลังแพ็คสินค้า">กำลังแพ็คสินค้า</option>
                    <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                    <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                    <option value="ได้รับสินค้าแล้ว">ได้รับสินค้าแล้ว</option>
                  </select>
                </div>

                {/* แสดงสถานะเมื่อลูกค้าได้รับสินค้าแล้ว */}
                {order.status === "ได้รับสินค้าแล้ว" && (
                  <div className="mt-4 text-green-600 font-medium text-sm">
                    ✓ ลูกค้าได้รับสินค้าแล้ว
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              ไม่พบรายการที่ค้นหา
            </div>
          )}
        </div>
      </div>

      {showQRProof && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">สลิปการโอนเงิน</h2>
            <img
              src={`${selectedOrder.paymentProof}`}
              alt="QR Code Payment Proof"
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
            <button
              onClick={() => setShowQRProof(false)}
              className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
                    <p className="mt-1">ราคา: ฿{item.price + 50}</p>
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

export default Ordershopme;
