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
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    trackingNumber: "",
    shippingProvider: "",
  });

  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }

    try {
      const response = await axios.get(backendUrl + "/api/order/shop-orders", {
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

  const statusHandler = async (event, orderId, itemId) => {
    try {
      console.log("Updating status for:", {
        orderId,
        itemId,
        newStatus: event.target.value,
      });

      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        {
          orderId,
          itemId,
          status: event.target.value,
          confirmedByCustomer: event.target.value === "ได้รับสินค้าแล้ว",
        },
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success("อัพเดทสถานะสำเร็จ");
        await fetchAllOrders(); // รีโหลดข้อมูลใหม่
      } else {
        toast.error(response.data.message || "ไม่สามารถอัพเดทสถานะได้");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(
        error.response?.data?.message || "เกิดข้อผิดพลาดในการอัพเดทสถานะ"
      );
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

    const name = order.shippingAddress?.name?.toLowerCase() || "";
    if (name.includes(searchLower)) return true;

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
      Pink: "ชมู",
      Orange: "ส้ม",
      Brown: "น้ำตาล",
      Beige: "เบจ",
    };
    return colorNames[colorName] || colorName;
  };

  const updateShippingInfo = async () => {
    try {
      if (!shippingInfo.trackingNumber || !shippingInfo.shippingProvider) {
        toast.error("กรุณากรอกเลขพัสดุและเลือกบริษัทขนส่ง");
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/order/shipping`,
        {
          orderId: selectedOrder._id,
          itemId: selectedOrder.currentItem._id,
          size: selectedOrder.currentItem.size,
          trackingNumber: shippingInfo.trackingNumber,
          shippingProvider: shippingInfo.shippingProvider,
        },
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success("อัพเดทข้อมูลการจัดส่งสำเร็จ");
        setShowShippingModal(false);
        setShippingInfo({
          trackingNumber: "",
          shippingProvider: "",
        });
        await fetchAllOrders();
      } else {
        toast.error(
          response.data.message || "ไม่สามารถอัพเดทข้อมูลการจัดส่งได้"
        );
      }
    } catch (error) {
      console.error("Error updating shipping info:", error);
      toast.error(
        error.response?.data?.message ||
          "เกิดข้อผิดพลาดในการอัพเดทข้อมูลการจัดส่ง"
      );
    }
  };

  const groupOrdersByDate = (orders) => {
    const groupedOrders = {};
    orders.forEach((order) => {
      const orderDate = new Date(order.date).toLocaleDateString("th-TH");

      if (!groupedOrders[orderDate]) {
        groupedOrders[orderDate] = [];
      }

      groupedOrders[orderDate].push(order);
    });
    return groupedOrders;
  };

  return (
    <div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-4">รายการสั่งซื้อลูกค้า</h3>
        <div className="space-y-8">
          {Object.entries(groupOrdersByDate(filteredOrders))
            .sort((a, b) => new Date(b[0]) - new Date(a[0]))
            .map(([date, dateOrders]) => (
              <div key={date} className="border-b pb-6">
                <div className="space-y-6">
                  {dateOrders.map((order) => (
                    <div key={order._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                          <h4 className="text-lg font-medium">
                            คำสั่งซื้อ #{order._id.slice(-6)}
                          </h4>
                          <div className="text-sm bg-gray-100 px-2 py-1 rounded">
                            รายการสินค้าทั้งหมด:{" "}
                            {order.items.reduce(
                              (total, item) => total + item.quantity,
                              0
                            )}{" "}
                            ชิ้น
                          </div>
                          <div className="text-sm font-medium">
                            ยอดรวม: ฿
                            {order.items
                              .reduce(
                                (total, item) =>
                                  total +
                                  (item.price + item.shippingCost) *
                                    item.quantity,
                                0
                              )
                              .toLocaleString()}
                          </div>
                          {order.transferredToShop && (
                            <div>
                              <span className="text-green-500">
                                บริษัทโอนเงินแล้ว
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="text-gray-600">
                              วันที่สั่งซื้อ:{" "}
                            </span>
                            {new Date(order.date).toLocaleDateString("th-TH")}
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">ชำระเงิน: </span>
                            {order.paymentMethod === "QR Code"
                              ? "โอนเงิน"
                              : "เก็บเงินปลายทาง"}
                          </div>
                          {order.paymentMethod === "QR Code" && (
                            <button
                              onClick={() => viewQRProof(order)}
                              className="bg-black hover:bg-gray-800 text-white px-3 py-1.5 rounded text-sm"
                            >
                              ตรวจสอบการชำระเงิน
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  "คุณต้องการลบสินค้านี้ใช่หรือไม่?"
                                )
                              ) {
                                deleteOrder(order._id);
                              }
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2"
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

                      <div className="space-y-4">
                        {order.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="bg-white rounded-lg shadow-md p-4 relative mb-4"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-4">
                                <img
                                  className="w-24 h-24 object-cover rounded"
                                  src={item.image[0]}
                                  alt={item.name}
                                />
                                <div>
                                  <h4 className="font-medium text-lg">
                                    {item.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-gray-600">
                                      จำนวน: {item.quantity}
                                    </span>
                                    <span className="text-gray-600">
                                      ไซส์: {item.size}
                                    </span>
                                  </div>
                                  {item.colors && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <span className="text-gray-600">สี:</span>
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
                                  <p className="font-medium mt-1">
                                    ฿
                                    {(
                                      item.price + item.shippingCost
                                    ).toLocaleString()}{" "}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                              <div>
                                <h5 className="font-medium mb-2">
                                  ที่อยู่จัดส่ง:
                                </h5>
                                <p>
                                  {item.shippingAddress?.name || "ไม่ระบุชื่อ"}
                                </p>
                                <p>
                                  โทร:{" "}
                                  {item.shippingAddress?.phoneNumber ||
                                    "ไม่ระบุเบอร์โทร"}
                                </p>
                                <p>
                                  {item.shippingAddress?.addressLine1 || ""}
                                </p>
                                {item.shippingAddress?.addressLine2 && (
                                  <p>{item.shippingAddress.addressLine2}</p>
                                )}
                                <p>
                                  {item.shippingAddress?.district &&
                                    `เขต/อำเภอ ${item.shippingAddress.district}`}
                                </p>
                                <p>
                                  {item.shippingAddress?.province &&
                                    `จังหวัด ${item.shippingAddress.province}`}
                                </p>
                                <p>
                                  {item.shippingAddress?.postalCode &&
                                    `รหัสไปรษณีย์ ${item.shippingAddress.postalCode}`}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 flex justify-between items-center">
                              <div className="flex-1">
                                {item.trackingNumber && (
                                  <div className="bg-gray-50 p-3 rounded-md inline-block">
                                    <p className="text-sm font-medium">
                                      เลขพัสดุ: {item.trackingNumber}
                                    </p>
                                    <p className="text-sm font-medium">
                                      ขนส่ง: {item.shippingProvider}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <select
                                  onChange={(event) =>
                                    statusHandler(event, order._id, item._id)
                                  }
                                  value={item.status}
                                  className={`w-[180px] p-2 border rounded font-medium text-sm ${
                                    item.confirmedByCustomer
                                      ? "bg-gray-100 text-gray-500"
                                      : "bg-gray-50"
                                  }`}
                                  disabled={item.confirmedByCustomer}
                                >
                                  <option value="รอดำเนินการ">
                                    รอดำเนินการ
                                  </option>
                                  <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                                  <option value="ได้รับสินค้าแล้ว">
                                    ได้รับสินค้าแล้ว
                                  </option>
                                </select>

                                <button
                                  onClick={() => {
                                    setSelectedOrder({
                                      _id: order._id,
                                      currentItem: {
                                        _id: item._id,
                                        ...item,
                                      },
                                    });
                                    setShippingInfo({
                                      trackingNumber: item.trackingNumber || "",
                                      shippingProvider:
                                        item.shippingProvider || "",
                                    });
                                    setShowShippingModal(true);
                                  }}
                                  className={`w-[180px] px-4 py-2 rounded text-sm transition-colors ${
                                    item.status === "ได้รับสินค้าแล้ว"
                                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                      : "bg-black text-white hover:bg-gray-800"
                                  }`}
                                  disabled={item.status === "ได้รับสินค้าแล้ว"}
                                >
                                  {item.trackingNumber
                                    ? "แก้ไขข้อมูลจัดส่ง"
                                    : "เพิ่มข้อมูลจัดส่ง"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">สินค้าในออเดอร์</h2>
              <button
                onClick={() => setShowProducts(false)}
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
                              title={getColorName(color)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="mt-1">ราค: ฿{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showShippingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="relative bg-white rounded-lg p-6 w-full max-w-md">
            <button
              onClick={() => setShowShippingModal(false)}
              className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600"
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
            <h3 className="text-lg font-medium mb-6">ข้อมูลการจัดส่ง</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เลขพัสดุ
                </label>
                <input
                  type="text"
                  value={shippingInfo.trackingNumber}
                  onChange={(e) =>
                    setShippingInfo((prev) => ({
                      ...prev,
                      trackingNumber: e.target.value,
                    }))
                  }
                  placeholder="กรอกเลขพัสดุ"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  บริษัทขนส่ง
                </label>
                <select
                  value={shippingInfo.shippingProvider}
                  onChange={(e) =>
                    setShippingInfo((prev) => ({
                      ...prev,
                      shippingProvider: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">เลือกบริษัทขนส่ง</option>
                  <option value="Kerry Express">Kerry Express</option>
                  <option value="Flash Express">Flash Express</option>
                  <option value="Thailand Post">ไปรษณีย์ไทย</option>
                  <option value="J&T Express">J&T Express</option>
                  <option value="Ninja Van">Ninja Van</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => updateShippingInfo()}
                  className="flex-1 bg-black text-white py-2.5 rounded-md hover:bg-gray-800 transition-colors"
                >
                  บันทึกข้อมูล
                </button>
                <button
                  onClick={() => setShowShippingModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-md hover:bg-gray-200 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ordershopme;
