import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
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

  const updateOrderStatus = async (
    orderId,
    shopId,
    trackingNumber,
    shippingProvider
  ) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        {
          orderId,
          shopId,
          status: "ได้รับสินค้าแล้ว",
          confirmedByCustomer: true,
          trackingNumber,
          shippingProvider,
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

  const groupItemsByShop = (orders) => {
    return orders.map((order) => {
      const shopGroups = order.items.reduce((groups, item) => {
        const shopId = item.owner?._id || "unknown";
        if (!groups[shopId]) {
          groups[shopId] = {
            shopName: item.owner?.name || "ไม่ระบุร้านค้า",
            shopImage: item.owner?.profileImage,
            items: [],
            orderId: order._id,
            orderDate: order.date,
            amount: order.amount,
            paymentMethod: order.paymentMethod,
          };
        }
        const itemWithShipping = {
          ...item,
          trackingNumber: item.trackingNumber || null,
          shippingProvider: item.shippingProvider || null,
        };
        groups[shopId].items.push(itemWithShipping);
        return groups;
      }, {});

      return {
        orderId: order._id,
        orderDate: order.date,
        shops: Object.values(shopGroups),
      };
    });
  };

  const calculateItemTotal = (item) => {
    const itemPrice = item.price * item.quantity;
    const shipping = item.shippingCost || 0;
    return itemPrice + shipping;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-xl font-medium text-gray-900 mb-6">
        ประวัติการสั่งซื้อ
      </h1>

      <div className="space-y-6">
        {groupItemsByShop(orders).map((order, orderIndex) => (
          <div
            key={orderIndex}
            className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200"
          >
            {/* Order Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex gap-4">
                  <p className="text-gray-600">
                    วันที่:{" "}
                    <span className="text-gray-900">
                      {new Date(order.orderDate).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    จำนวนสินค้า:{" "}
                    <span className="text-gray-900">
                      {order.shops.reduce(
                        (total, shop) =>
                          total +
                          shop.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          ),
                        0
                      )}{" "}
                      ชิ้น
                    </span>
                  </p>
                </div>
                <p className="text-gray-600">
                  ชำระเงิน:{" "}
                  <span className="text-gray-900">
                    {order.shops[0].paymentMethod === "QR Code"
                      ? "โอนเงิน"
                      : order.shops[0].paymentMethod}
                  </span>
                </p>
              </div>
            </div>

            {/* Shops */}
            <div className="divide-y divide-gray-100">
              {order.shops.map((shop, shopIndex) => (
                <div key={shopIndex} className="p-4">
                  {/* Shop Header */}
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                    {shop.shopImage ? (
                      <img
                        src={shop.shopImage}
                        alt={shop.shopName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-sm text-gray-500">
                          {shop.shopName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <h2 className="text-sm font-medium text-gray-900">
                      {shop.shopName}
                    </h2>
                  </div>

                  {/* Items */}
                  <div className="space-y-4">
                    {shop.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex gap-3">
                        <img
                          src={item.image[0]}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md bg-gray-50 border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-medium text-gray-900">
                              {item.name}
                            </h3>
                            <p className="text-sm font-medium text-gray-900">
                              ฿
                              {(
                                item.price * item.quantity +
                                (item.shippingCost || 0)
                              ).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                            <p>จำนวน: {item.quantity}</p>
                            <p>ไซส์: {item.size}</p>
                            <div className="flex items-center gap-1">
                              <span>สี:</span>
                              {item.colors.map((color, colorIdx) => (
                                <div
                                  key={colorIdx}
                                  className={`w-4 h-4 rounded-full ${getColorClass(
                                    color
                                  )} border border-gray-200`}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>

                          {item.trackingNumber && item.shippingProvider && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-md">
                              <div className="flex flex-col gap-1">
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">เลขพัสดุ:</span>{" "}
                                  {item.trackingNumber}
                                </p>
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">ขนส่ง:</span>{" "}
                                  {item.shippingProvider}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="mt-2 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-xs text-gray-700">
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    รวมการสั่งซื้อ:{" "}
                    <span className="text-base">
                      ฿
                      {order.shops
                        .reduce(
                          (total, shop) =>
                            total +
                            shop.items.reduce(
                              (sum, item) => sum + calculateItemTotal(item),
                              0
                            ),
                          0
                        )
                        .toLocaleString()}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    const orderData = orders.find(
                      (o) => o._id === order.orderId
                    );
                    setSelectedOrder(orderData);
                    setShowTrackingModal(true);
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  รายละเอียดสินค้า
                </button>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">ไม่มีประวัติการสั่งซื้อ</p>
          </div>
        )}
      </div>

      {showTrackingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  รายละเอียดสินค้า
                </h2>
                <div className="text-sm text-gray-600 mt-1 space-y-1">
                  <p>
                    รวมจำนวนสินค้า:{" "}
                    <span className="font-medium">
                      {selectedOrder.items.reduce(
                        (total, item) => total + item.quantity,
                        0
                      )}{" "}
                      ชิ้น
                    </span>
                  </p>
                  <p>
                    รวมการสั่งซื้อ:{" "}
                    <span className="font-medium text-gray-900">
                      ฿
                      {selectedOrder.items
                        .reduce(
                          (total, item) =>
                            total +
                            (item.price * item.quantity +
                              (item.shippingCost || 0)),
                          0
                        )
                        .toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTrackingModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 space-y-6">
              {Object.values(
                selectedOrder.items.reduce((shops, item) => {
                  const shopId = item.owner?._id || "unknown";
                  if (!shops[shopId]) {
                    shops[shopId] = {
                      shopName: item.owner?.name || "ไม่ระบุร้านค้า",
                      shopImage: item.owner?.profileImage,
                      items: [],
                    };
                  }
                  shops[shopId].items.push(item);
                  return shops;
                }, {})
              ).map((shop, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  {/* Shop Header */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                    {shop.shopImage ? (
                      <img
                        src={shop.shopImage}
                        alt={shop.shopName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                        <span className="text-gray-500 font-medium">
                          {shop.shopName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-medium text-gray-900">
                      {shop.shopName}
                    </h3>
                  </div>

                  {/* Shop Items */}
                  <div className="space-y-4">
                    {shop.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex gap-4">
                          <img
                            src={item.image[0]}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg border border-gray-100"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-base font-medium text-gray-900 mb-1">
                                {item.name}
                              </h4>
                              <p className="text-lg font-semibold text-gray-900">
                                ฿
                                {(
                                  item.price * item.quantity +
                                  (item.shippingCost || 0)
                                ).toLocaleString()}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">จำนวน:</span>
                                <span className="font-medium text-gray-900">
                                  {item.quantity} ชิ้น
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">ไซส์:</span>
                                <span className="font-medium text-gray-900">
                                  {item.size}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">สี:</span>
                                <div className="flex items-center gap-1">
                                  {item.colors.map((color, colorIdx) => (
                                    <div
                                      key={colorIdx}
                                      className={`w-5 h-5 rounded-full ${getColorClass(
                                        color
                                      )} border border-gray-200 shadow-sm`}
                                      title={color}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">สถานะ:</span>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  <span className="font-medium text-gray-900">
                                    {item.status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {item.trackingNumber && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-500">
                                      เลขพัสดุ:{" "}
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {item.trackingNumber}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      ขนส่ง:{" "}
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {item.shippingProvider}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {item.status !== "ได้รับสินค้าแล้ว" &&
                              item.trackingNumber && (
                                <button
                                  onClick={() =>
                                    updateOrderStatus(
                                      selectedOrder._id,
                                      item.owner._id,
                                      item.trackingNumber,
                                      item.shippingProvider
                                    )
                                  }
                                  className="mt-4 w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                                >
                                  ยืนยันการรับสินค้า
                                </button>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
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
