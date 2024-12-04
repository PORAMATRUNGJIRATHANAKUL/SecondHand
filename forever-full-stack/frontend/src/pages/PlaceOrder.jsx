import React, { useContext, useState, useRef, useEffect } from "react";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import qrcodePaymentImage from "../assets/qrcode_payment.png";
import { v4 as uuidv4 } from "uuid";

const { currency } = assets;

const PlaceOrder = () => {
  const [method, setMethod] = useState("");
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofFileName, setPaymentProofFileName] = useState(null);
  const fileInputRef = useRef(null);
  const [showSlipPreview, setShowSlipPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
    selectedProducts,
    getProductsData,
  } = useContext(ShopContext);

  const generateUniqueFileName = (originalFileName) => {
    const timestamp = new Date().getTime();
    const uniqueId = uuidv4().slice(0, 8);
    const fileExtension = originalFileName.split(".").pop();
    return `payment_proof_${timestamp}_${uniqueId}.${fileExtension}`;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
        return;
      }
      const uniqueFileName = generateUniqueFileName(file.name);
      setPaymentProofFileName(uniqueFileName);
      const renamedFile = new File([file], uniqueFileName, { type: file.type });
      setPaymentProof(renamedFile);
      toast.success("อัพโหลดสลิปเรียบร้อยแล้ว");
    }
  };

  const placeOrder = async () => {
    try {
      console.log("Selected products:", selectedProducts);
      console.log("Available products:", products);

      if (!selectedProducts || selectedProducts.length === 0) {
        throw new Error("ไม่พบรายการสินค้าที่เลือก");
      }

      const orderItems = selectedProducts.map((item) => {
        if (!item.productId) {
          console.error("Missing productId for item:", item);
          throw new Error("ข้อมูลสินค้าไม่ถูกต้อง");
        }

        const product = products.find((p) => p._id === item.productId);
        console.log(`Looking for product with ID: ${item.productId}`, product);

        if (!product) {
          throw new Error(`ไม่พบข้อมูลสินค้ารหัส ${item.productId}`);
        }

        const shippingAddress = item.shippingAddress;
        if (!shippingAddress) {
          throw new Error(`กรุณาระบุที่อยู่จัดส่งสำหรับสินค้า ${product.name}`);
        }

        const orderItem = {
          productId: item.productId,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          owner:
            typeof product.owner === "object"
              ? product.owner._id
              : product.owner,
          shippingCost: product.shippingCost || 50,
          image: product.image?.[0] || product.images?.[0] || "",
          shippingAddress: {
            name: shippingAddress.name,
            phoneNumber: shippingAddress.phoneNumber,
            addressLine1: shippingAddress.addressLine1,
            addressLine2: shippingAddress.addressLine2 || "",
            district: shippingAddress.district,
            province: shippingAddress.province,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country || "ประเทศไทย",
          },
        };

        console.log("Created order item:", orderItem);
        return orderItem;
      });

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + (item.price * item.quantity + item.shippingCost),
        0
      );

      let orderData = {
        items: orderItems,
        amount: totalAmount,
        paymentMethod: method,
      };

      if (method === "QR Code" && paymentProof) {
        const formData = new FormData();
        formData.append("paymentProof", paymentProof);

        console.log("Uploading payment proof:", paymentProof);

        const uploadResponse = await axios.post(
          `${backendUrl}/api/order/verify-qr`,
          formData,
          {
            headers: {
              token,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Upload response:", uploadResponse.data);

        if (uploadResponse.data.success) {
          orderData.paymentProof = uploadResponse.data.paymentProofPath;
          console.log("Payment proof URL:", orderData.paymentProof);
        }
      }

      console.log("Final order data:", orderData);

      const response = await axios.post(
        `${backendUrl}/api/order/place`,
        orderData,
        {
          headers: {
            token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("สั่งซื้อสินค้าสำเร็จ");
        setCartItems([]);
        navigate("/orders");
      } else {
        throw new Error(response.data.message || "เกิดข้อผิดพลาดในการสั่งซื้อ");
      }
    } catch (error) {
      console.error("Error in placeOrder:", error);
      toast.error(error.message || "เกิดข้อผิดพลาดในการสั่งซื้อ");
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!method) {
      toast.error("กรุณาเลือกวิธีการชำระเงิน");
      return;
    }

    if (method === "QR Code" && !paymentProof) {
      toast.error("กรุณาอัพโหลดหลักฐานการชำระเงิน");
      return;
    }

    try {
      await placeOrder();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการสั่งซื้อ:", error);
      toast.error(error.message || "เกิดข้อผิดพลาดในการสั่งซื้อ");
    }
  };

  const clearFileUpload = () => {
    setPaymentProof(null);
    setPaymentProofFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Group products by store
  const groupedByStore = selectedProducts.reduce((groups, item) => {
    const product = products.find((p) => p._id === item.productId);
    if (!product) return groups;

    const storeId = product.owner?._id || "unknown";

    if (!groups[storeId]) {
      groups[storeId] = {
        storeId,
        storeName: product.owner?.name || "ไม่ระบุชื่อร้าน",
        storeImage: product.owner?.profileImage,
        items: [],
        totalItems: 0,
        totalAmount: 0,
        totalShipping: 0,
      };
    }

    groups[storeId].items.push({ ...item, product });
    groups[storeId].totalItems += item.quantity;
    groups[storeId].totalAmount += product.price * item.quantity;
    groups[storeId].totalShipping +=
      (product.shippingCost || 0) * item.quantity;

    return groups;
  }, {});

  useEffect(() => {
    // ตรวจสอบว่ามีข้อมูลสินค้าหรือไม่
    if (!products || products.length === 0) {
      getProductsData(); // เรียกฟังก์ชันโหลดข้อมูลสินค้าใหม่
    }

    console.log("Products in context:", products);
    console.log("Selected products:", selectedProducts);
  }, [products, selectedProducts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ยืนยันคำสั่งซื้อ
          </h1>
          <p className="text-gray-600">
            รายการสินค้าทั้งหมด{" "}
            {Object.values(groupedByStore).reduce(
              (total, store) => total + store.totalItems,
              0
            )}{" "}
            ชิ้น
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product List Section */}
          <div className="lg:col-span-2 space-y-8">
            {Object.values(groupedByStore).map((store) => (
              <div
                key={store.storeId}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
              >
                {/* Store Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {store.storeImage ? (
                        <img
                          src={store.storeImage}
                          alt={store.storeName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-xl font-semibold text-gray-600">
                            {store.storeName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {store.storeName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          สินค้าทั้งหมด {store.totalItems} ชิ้น
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        ยอดสินค้า: ฿{store.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        ค่าจัดส่ง: ฿{store.totalShipping.toLocaleString()}
                      </p>
                      <p className="font-medium text-gray-900">
                        รวม: ฿
                        {(
                          store.totalAmount + store.totalShipping
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Store Products */}
                <div className="divide-y divide-gray-100">
                  {store.items.map(
                    ({ product, size, color, quantity, shippingAddress }) => (
                      <div
                        key={`${product._id}-${size}-${color}`}
                        className="p-6 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="flex gap-6">
                          <div className="flex-shrink-0">
                            <img
                              src={product.image[0]}
                              alt={product.name}
                              className="w-32 h-32 object-cover rounded-lg shadow-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                              {product.name}
                            </h4>
                            <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">
                                  ราคาต่อชิ้น:
                                </span>
                                <span className="font-semibold text-gray-900">
                                  ฿{product.price.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">จำนวน:</span>
                                <span className="font-medium px-2 py-1 bg-gray-100 rounded-md">
                                  {quantity} ชิ้น
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">ไซส์:</span>
                                <span className="font-medium px-2 py-1 bg-gray-100 rounded-md">
                                  {size}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">สี:</span>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-6 h-6 rounded-full border shadow-sm"
                                    style={{ backgroundColor: color }}
                                  />
                                  <span className="text-gray-700">{color}</span>
                                </div>
                              </div>
                            </div>

                            {/* Add shipping address section */}
                            <div className="mt-4 border-t pt-4">
                              <h5 className="text-sm font-medium text-gray-900 mb-2">
                                ที่อยู่จัดส่ง
                              </h5>
                              {shippingAddress ? (
                                <div className="text-sm text-gray-600">
                                  <p className="font-medium">
                                    {shippingAddress.name}
                                  </p>
                                  <p>{shippingAddress.phoneNumber}</p>
                                  <p>{shippingAddress.addressLine1}</p>
                                  {shippingAddress.addressLine2 && (
                                    <p>{shippingAddress.addressLine2}</p>
                                  )}
                                  <p>
                                    {shippingAddress.district}{" "}
                                    {shippingAddress.province}{" "}
                                    {shippingAddress.postalCode}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-red-500">
                                  ไม่พบข้อมูลที่อยู่จัดส่ง
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                สรุปคำสั่งซื้อ
              </h2>
              <div className="space-y-4">
                {Object.values(groupedByStore).map((store) => (
                  <div key={store.storeId} className="border-b pb-4">
                    <p className="font-medium text-gray-900">
                      {store.storeName}
                    </p>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>ยอดสินค้า</span>
                        <span>฿{store.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>ค่าจัดส่ง</span>
                        <span>฿{store.totalShipping.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-4">
                  <div className="flex justify-between font-medium text-gray-900">
                    <span>ยอดรวมทั้งหมด</span>
                    <span>
                      ฿
                      {Object.values(groupedByStore)
                        .reduce(
                          (total, store) =>
                            total + store.totalAmount + store.totalShipping,
                          0
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                วิธีชำระเงิน
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="cod"
                    value="Cash on Delivery"
                    checked={method === "Cash on Delivery"}
                    onChange={(e) => {
                      setMethod(e.target.value);
                      setPaymentProof(null);
                    }}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="cod" className="ml-3 text-gray-700">
                    ชำระเงินปลายทาง
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="qr"
                    value="QR Code"
                    checked={method === "QR Code"}
                    onChange={(e) => setMethod(e.target.value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="qr" className="ml-3 text-gray-700">
                    QR Code
                  </label>
                </div>

                {method === "QR Code" && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="mb-4">
                      <img
                        src={qrcodePaymentImage}
                        alt="QR Code Payment"
                        className="w-48 h-48 mx-auto"
                      />
                      <p className="text-center text-sm text-gray-600 mt-2">
                        สแกน QR Code เพื่อชำระเงินจำนวน{" "}
                        <span className="font-semibold">
                          ฿
                          {Object.values(groupedByStore)
                            .reduce(
                              (total, store) =>
                                total + store.totalAmount + store.totalShipping,
                              0
                            )
                            .toLocaleString()}
                        </span>
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">
                        แนบสลิปการโอนเงิน:
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        className="hidden"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 text-sm"
                        >
                          แนบสลิปการโอนเงิน
                        </button>
                        {paymentProof && (
                          <button
                            onClick={() => setShowSlipPreview(true)}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 text-sm"
                          >
                            ตรวจสอบสลิปการโอนเงิน
                          </button>
                        )}
                      </div>
                      {paymentProof && (
                        <p className="text-sm text-green-600">
                          ✓ อัพโหลดสลิปเรียบร้อยแล้ว: {paymentProofFileName}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={onSubmitHandler}
              disabled={!method}
              className={`w-full py-3 px-4 rounded-lg transition-colors duration-200 ${
                method
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {!method ? "กรุณาเลือกวิธีการชำระเงิน" : "ยืนยันคำสั่งซื้อ"}
            </button>
          </div>
        </div>
      </div>

      {/* Slip Preview Modal */}
      {showSlipPreview && paymentProof && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">หลักฐานการชำระเงิน</h3>
              <button
                onClick={() => setShowSlipPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <img
              src={URL.createObjectURL(paymentProof)}
              alt="Payment Slip"
              className="w-full rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;
