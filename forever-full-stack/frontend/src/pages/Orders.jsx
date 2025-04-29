import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import AddReviewModal from "../components/AddReviewModal";

const Orders = () => {
  const { backendUrl, token, getProductsData } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    images: [],
    description: "",
    phone: "",
    shopId: "",
    orderId: "",
    productId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const updateOrderStatus = async (orderId, itemId, size) => {
    try {
      console.log("Attempting to update order status with:", {
        orderId,
        itemId,
        size,
      });

      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        {
          orderId: orderId,
          itemId: itemId,
          size: size,
          status: "ได้รับสินค้าแล้ว",
          confirmedByCustomer: true,
        },
        {
          headers: {
            token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("ยืนยันการรับสินค้าสำเร็จ");
        setShowTrackingModal(false);
        await loadOrderData();
      } else {
        console.error("Update failed:", response.data);
        toast.error(response.data.message || "ไม่สามารถอัพเดทสถานะได้");
      }
    } catch (error) {
      console.error("Error updating status:", error.response?.data || error);
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
      const shopGroups = order.items.reduce((acc, item) => {
        const shopId = item.owner._id;
        if (!acc[shopId]) {
          acc[shopId] = {
            shopId,
            shopName: item.owner.name,
            shopImage: item.owner.profileImage,
            items: [],
            paymentMethod: order.paymentMethod,
            canConfirm: false,
          };
        }
        acc[shopId].items.push(item);
        if (
          item.trackingNumber &&
          !item.confirmedByCustomer &&
          item.status !== "ได้รับสินค้าแล้ว"
        ) {
          acc[shopId].canConfirm = true;
        }
        return acc;
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

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ขนาดรูปภาพต้องไม่เกิน 5MB");
        return;
      }
    });

    setContactForm((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const removeFile = (index) => {
    setContactForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      contactForm.images.forEach((image) => {
        formData.append("images", image);
      });
      formData.append("description", contactForm.description);
      formData.append("phone", contactForm.phone);
      formData.append("shopId", contactForm.shopId);
      formData.append("orderId", contactForm.orderId);
      formData.append("productId", contactForm.productId);

      const response = await axios.post(
        `${backendUrl}/api/order/contact`,
        formData,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("ส่งข้อมูลการติดต่อเรียบร้อยแล้ว");
        setShowContactModal(false);
        setContactForm({
          images: [],
          description: "",
          phone: "",
          shopId: "",
          orderId: "",
          productId: "",
        });
      }
    } catch (error) {
      console.error("Error submitting contact:", error);
      toast.error(
        error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งข้อมูล"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderColorDisplay = (color) => {
    return (
      <div
        className="w-5 h-5 rounded-full border border-gray-200 shadow-sm"
        style={{ backgroundColor: color }}
        title={color}
      />
    );
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
                        alt={shop.shopName || "Shop"}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-sm text-gray-500">
                          {(shop.shopName || "S").charAt(0)}
                        </span>
                      </div>
                    )}
                    <h2 className="text-sm font-medium text-gray-900">
                      {shop.shopName || "ร้านค้า"}
                    </h2>
                  </div>

                  {/* Items */}
                  <div className="space-y-4">
                    {shop.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex gap-4">
                        <img
                          src={
                            Array.isArray(item.image)
                              ? item.image[0]
                              : item.image
                          }
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          {/* Item Details */}
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

                          {/* Product Details */}
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
                                {renderColorDisplay(item.color)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">สถานะ:</span>
                              <div className="flex items-center gap-1.5">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    item.status === "ได้รับสินค้าแล้ว"
                                      ? "bg-green-500"
                                      : item.status === "จัดส่งแล้ว"
                                      ? "bg-blue-500"
                                      : "bg-yellow-500"
                                  }`}
                                ></div>
                                <span className="font-medium text-gray-900">
                                  {item.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Shipping Address */}
                          <div className="flex justify-between">
                            {item.shippingAddress && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <h5 className="text-sm font-medium text-gray-900 mb-2">
                                  ที่อยู่จัดส่ง:
                                </h5>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p>{item.shippingAddress.name}</p>
                                  <p>{item.shippingAddress.phoneNumber}</p>
                                  <p>{item.shippingAddress.addressLine1}</p>
                                  {item.shippingAddress.addressLine2 && (
                                    <p>{item.shippingAddress.addressLine2}</p>
                                  )}
                                  <p>
                                    {item.shippingAddress.district}{" "}
                                    {item.shippingAddress.province}{" "}
                                    {item.shippingAddress.postalCode}
                                  </p>
                                  <p>
                                    {item.shippingAddress.country ||
                                      "ประเทศไทย"}
                                  </p>
                                </div>
                              </div>
                            )}

                            {item.confirmedByCustomer && (
                              <div className="flex items-end">
                                <button
                                  onClick={() => {
                                    setSelectedProduct(item);
                                    setShowReviewModal(true);
                                  }}
                                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                >
                                  รีวิวสินค้า
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Shipping Details */}
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
                                  <span className="text-gray-500">ขนส่ง: </span>
                                  <span className="font-medium text-gray-900">
                                    {item.shippingProvider}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
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
                    รวมการการสั่งซื้อ:{" "}
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
                <div className="flex gap-4">
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
                      canConfirm: false,
                    };
                  }
                  shops[shopId].items.push(item);
                  // อัพเดทสถานะ canConfirm ถ้ามีสินค้าใดๆ ที่ยังไม่ได้ยืนยัน
                  if (
                    item.trackingNumber &&
                    !item.confirmedByCustomer &&
                    item.status !== "ได้รับสินค้าแล้ว"
                  ) {
                    shops[shopId].canConfirm = true;
                  }
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

                            {/* รายละเอียดสินค้า */}
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
                                  {renderColorDisplay(item.color)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">สถานะ:</span>
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      item.status === "ได้รับสินค้าแล้ว"
                                        ? "bg-green-500"
                                        : item.status === "จัดส่งแล้ว"
                                        ? "bg-blue-500"
                                        : "bg-yellow-500"
                                    }`}
                                  ></div>
                                  <span className="font-medium text-gray-900">
                                    {item.status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* ข้อมูลการจัดส่ง */}
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shop Actions - ย้ายมาไว้ในโมดัล */}
                  <div className="mt-4 border-t pt-4 flex gap-2">
                    {/* ปุ่มติดต่อร้านค้า */}
                    <button
                      onClick={() => {
                        setContactForm((prev) => ({
                          ...prev,
                          shopId: shop.items[0].owner._id,
                          orderId: selectedOrder._id,
                          productId: shop.items[0]._id,
                        }));
                        setShowContactModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-neutral-300 text-black rounded-md hover:bg-gray-400 transition-colors text-sm font-medium"
                    >
                      ติดต่อร้านค้า
                    </button>

                    {/* ปุ่มยืนยันการรับสินค้าสำหรับทั้งร้าน */}
                    <button
                      onClick={() => {
                        // ยืนยันการรับสินค้าทั้งหมดในร้าน
                        shop.items.forEach((item) => {
                          console.log(item);
                          if (
                            item.trackingNumber &&
                            !item.confirmedByCustomer &&
                            item.status !== "ได้รับสินค้าแล้ว" &&
                            item.size
                          ) {
                            updateOrderStatus(
                              selectedOrder._id,
                              item._id,
                              item.size
                            );
                          }
                        });
                      }}
                      className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={!shop.canConfirm}
                    >
                      {shop.canConfirm
                        ? "ยืนยันการรับสินค้าทั้งหมด"
                        : "ยืนยันการรับสินค้าแล้ว"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showReviewModal && selectedProduct && (
        <AddReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          product={selectedProduct}
        />
      )}

      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">ติดต่อร้านค้า</h2>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รูปภาพ (สูงสุด 5 รูป)
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  • ขนาดไฟล์: ไม่เกิน 5MB ต่อรูป
                  <br />• ไฟล์ที่รองรับ: JPG, JPEG, PNG, GIF
                </p>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/gif"
                  multiple
                  onChange={(e) => handleFileUpload(e, "image")}
                  className="w-full"
                  disabled={contactForm.images.length >= 5}
                />
                <div className="flex gap-2 mt-2">
                  {contactForm.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`preview ${index}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index, "image")}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รายละเอียดปัญหา
                </label>
                <textarea
                  value={contactForm.description}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                  rows="4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เบอร์โทรติดต่อ
                </label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                >
                  {isSubmitting ? "กำลังส่ง..." : "ส่งข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
