import React, { useContext, useState, useRef, useCallback } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import qrcodePaymentImage from "../assets/qrcode_payment.png";
import { v4 as uuidv4 } from "uuid";
import { useEffect } from "react";

const PlaceOrder = () => {
  const [method, setMethod] = useState("");
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofFileName, setPaymentProofFileName] = useState(null);
  const fileInputRef = useRef(null);
  const [showSlipPreview, setShowSlipPreview] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddressData, setNewAddressData] = useState({
    name: "",
    addressLine1: "",
    addressLine2: "",
    province: "",
    district: "",
    postalCode: "",
    country: "ประเทศไทย",
    phoneNumber: "",
  });
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);

  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

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

  const placeOrder = useCallback(
    async (paymentProofPath = null) => {
      try {
        let orderItems = [];

        // for (const items in cartItems) {
        //   for (const item in cartItems[items]) {
        //     if (cartItems[items][item] > 0) {
        //       const itemInfo = structuredClone(
        //         products.find((product) => product._id === items)
        //       );
        //       if (itemInfo) {
        //         itemInfo.size = item;
        //         itemInfo.quantity = cartItems[items][item];
        //         orderItems.push(itemInfo);
        //       }
        //     }
        //   }
        // }

        for (let i = 0; i < cartItems.length; i++) {
          let itemInfo = products.find(
            (product) => product._id === cartItems[i].productId
          );

          const item = cartItems[i];
          itemInfo.size = item.size;
          itemInfo.quantity = item.quantity;
          itemInfo.colors = [item.color];
          orderItems.push(itemInfo);
        }

        let orderData = {
          address: selectedAddress,
          items: orderItems,
          amount: getCartAmount() + delivery_fee,
          paymentMethod: method,
        };

        if (paymentProofPath) {
          orderData.paymentProof = paymentProofPath;
        }

        const response = await axios.post(
          backendUrl + "/api/order/place",
          orderData,
          { headers: { token } }
        );
        if (response.data.success) {
          setCartItems([]);
          navigate("/orders");
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message);
      }
    },
    [
      cartItems,
      products,
      formData,
      getCartAmount,
      delivery_fee,
      method,
      paymentProofFileName,
      backendUrl,
      token,
      setCartItems,
      navigate,
      selectedAddress,
    ]
  );

  const confirmQRPayment = useCallback(async () => {
    if (!paymentProof) {
      toast.error("กรุณาอัพโหลดหลักฐานการชำระเงิน");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("paymentProof", paymentProof, paymentProofFileName);
      formData.append("amount", getCartAmount() + delivery_fee);

      const verifyResponse = await axios.post(
        backendUrl + "/api/order/verify-qr",
        formData,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          },
        }
      );

      setIsUploading(false);
      setUploadProgress(0);

      if (verifyResponse.data.success) {
        toast.success("ยืนยันการชำระเงินสำเร็จ!");
        setShowQRPopup(false);
        const paymentProofPath = verifyResponse.data.paymentProofPath;
        placeOrder(paymentProofPath);
      } else {
        toast.error(
          verifyResponse.data.message ||
            "การยืนยันการชำระเงินล้มเหลว กรุณาลองใหม่อีกครั้ง"
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการยืนยันการชำระเงิน");
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [
    paymentProof,
    paymentProofFileName,
    getCartAmount,
    delivery_fee,
    backendUrl,
    token,
    placeOrder,
  ]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (method === "QR Code") {
      if (!paymentProof) {
        toast.error("กรุณาทำการชำระเงินผ่าน QR Code ก่อน");
        return;
      }
      confirmQRPayment();
    } else {
      placeOrder();
    }
  };

  const clearFileUpload = () => {
    setPaymentProof(null);
    setPaymentProofFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/addresses`, {
          headers: { token },
        });
        if (response.data.success) {
          setAddresses(response.data.addresses);
          const defaultAddress = response.data.addresses.find(
            (addr) => addr.isDefault
          );
          if (defaultAddress) {
            setSelectedAddress(defaultAddress);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("ไม่สามารถดึงข้อมูลที่อยู่ได้");
      }
    };
    fetchAddresses();
  }, [backendUrl, token]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/address`,
        newAddressData,
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success("เพิ่มที่อยู่สำเร็จ");
        setAddresses([...addresses, response.data.address]);
        setSelectedAddress(response.data.address);
        setShowAddressForm(false);
        setNewAddressData({
          name: "",
          addressLine1: "",
          addressLine2: "",
          province: "",
          district: "",
          postalCode: "",
          country: "Thailand",
          phoneNumber: "",
        });
      } else {
        toast.error(response.data.message || "เกิดข้อผิดพลาดในการเพิ่มที่อยู่");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "เกิดข้อผิดพลาดในการเพิ่มที่อยู่";
      toast.error(errorMessage);
    }
  };

  const handleUpdateAddress = async (addressId) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/user/address/${addressId}`,
        newAddressData,
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success("แก้ไขที่อยู่สำเร็จ");
        setAddresses(
          addresses.map((addr) =>
            addr._id === addressId ? response.data.address : addr
          )
        );
        if (selectedAddress?._id === addressId) {
          setSelectedAddress(response.data.address);
        }
        setShowAddressForm(false);
      } else {
        toast.error(response.data.message || "เกิดข้อผิดพลาดในการแก้ไขที่อยู่");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "เกิดข้อผิดพลาดในการแก้ไขที่อยู่";
      toast.error(errorMessage);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/user/address/${addressId}`,
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success("ลบที่อยู่สำเร็จ");
        setAddresses(addresses.filter((addr) => addr._id !== addressId));
        if (selectedAddress?._id === addressId) {
          setSelectedAddress(null);
        }
      } else {
        toast.error(response.data.message || "เกิดข้อผิดพลาดในการลบที่อยู่");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "เกิดข้อผิดพลาดในการลบที่อยู่";
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setNewAddressData({
      name: "",
      addressLine1: "",
      addressLine2: "",
      province: "",
      district: "",
      postalCode: "",
      country: "Thailand",
      phoneNumber: "",
    });
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/user/address/${addressId}/default`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        const updatedAddresses = addresses.map((addr) => ({
          ...addr,
          isDefault: addr._id === addressId,
        }));
        setAddresses(updatedAddresses);
        toast.success("กำหนดที่อยู่หลักเรียบร้อย");
      }
    } catch (error) {
      console.error(error);
      toast.error("ไม่สามารถกำหนดที่อยู่หลักได้");
    }
  };

  return (
    <>
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
      >
        {/* ด้านซ้าย */}
        <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
          <div className="text-xl sm:text-2xl my-3">
            <Title text1={"ข้อมูล"} text2={"การจัดส่ง"} />
          </div>

          {/* แสดงที่อยู่ที่มีอยู่ */}
          {addresses.length > 0 && (
            <div className="mb-4 relative">
              <div
                onClick={() => setIsAddressDropdownOpen(!isAddressDropdownOpen)}
                className="w-full p-3 border rounded-md cursor-pointer flex justify-between items-center"
              >
                {selectedAddress ? (
                  <div>
                    <p>{selectedAddress.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedAddress.addressLine1}
                    </p>
                    <p className="text-sm text-gray-600">
                      {`${selectedAddress.district}, ${selectedAddress.province} ${selectedAddress.postalCode}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      โทร: {selectedAddress.phoneNumber}
                    </p>
                  </div>
                ) : (
                  <span className="text-gray-500">เลือกที่อยู่จัดส่ง</span>
                )}

                <svg
                  className={`w-5 h-5 transition-transform ${
                    isAddressDropdownOpen ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {/* Dropdown menu */}
              {isAddressDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between group ${
                        selectedAddress?._id === address._id ? "bg-gray-50" : ""
                      }`}
                      onClick={() => {
                        handleSelectAddress(address);
                        setIsAddressDropdownOpen(false);
                      }}
                    >
                      {/* ข้อมูลที่อยู่ */}
                      <div className="flex-grow">
                        <p>{address.name}</p>
                        <p className="text-sm text-gray-600">
                          {address.addressLine1}
                        </p>
                        <p className="text-sm text-gray-600">
                          {`${address.district}, ${address.province} ${address.postalCode}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.country}
                        </p>
                        <p className="text-sm text-gray-600">
                          โทร: {address.phoneNumber}
                        </p>
                      </div>

                      {/* ส่วนแสดงสถานะและปุ่มต่างๆ */}
                      <div
                        className="flex items-center gap-3 ml-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* ปุ่มแก้ไข */}
                        <div
                          className="hidden group-hover:block text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
                          onClick={() => {
                            setNewAddressData(address);
                            setShowAddressForm(true);
                            setIsAddressDropdownOpen(false);
                          }}
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </div>

                        {/* ปุ่มลบ */}
                        <div
                          className="hidden group-hover:block text-sm text-red-600 hover:text-red-800 cursor-pointer"
                          onClick={() => {
                            if (
                              window.confirm(
                                "คุณต้องการลบที่อยู่นี้ใช่หรือไม่?"
                              )
                            ) {
                              handleDeleteAddress(address._id);
                            }
                          }}
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
                        </div>

                        {/* ปุ่มตั้งค่าเริ่มต้น */}
                        {address.isDefault ? (
                          <span className="text-sm text-gray-500">
                            ค่าเริ่มต้น
                          </span>
                        ) : (
                          <div
                            className="hidden group-hover:block text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                            onClick={() => handleSetDefaultAddress(address._id)}
                          >
                            ตั้งเป็นค่าเริ่มต้น
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ปุ่มเพิ่มที่อยู่ใหม่ */}
          <button
            type="button"
            onClick={() => setShowAddressForm(true)}
            className="bg-gray-100 text-black px-4 py-2 rounded-md hover:bg-gray-200"
          >
            + เพิ่มที่อยู่ใหม่
          </button>
        </div>
        {/* ด้านขวา */}
        <div className="mt-8">
          <div className="mt-8 min-w-80">
            <CartTotal />
          </div>

          <div className="mt-12">
            <Title text1={"วิธี"} text2={"ชำระเงิน"} />
            {/* เลือกวิธีชำระเงิน */}
            <div className="flex gap-3 flex-col lg:flex-row">
              <div
                onClick={() => {
                  setShowQRPopup(true);
                  setMethod("QR Code");
                }}
                className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
              >
                <p
                  className={`min-w-3.5 h-3.5 border rounded-full ${
                    method === "QR Code" ? "bg-green-400" : ""
                  }`}
                ></p>
                <p className="text-gray-500 text-sm font-medium mx-4">
                  สแกน QR CODE
                </p>
                <img className="h-5 mx-4" src={assets.logo_qrcode} alt="" />
              </div>
              <div
                onClick={() => {
                  setMethod("ชำระเงินปลายทาง");
                  setPaymentProof(null);
                  setPaymentProofFileName(null);
                }}
                className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
              >
                <p
                  className={`min-w-3.5 h-3.5 border rounded-full ${
                    method === "ชำระเงินปลายทาง" ? "bg-green-400" : ""
                  }`}
                ></p>
                <p className="text-gray-500 text-sm font-medium mx-4">
                  ชำระเงินปลายทาง
                </p>
              </div>
            </div>

            <div className="w-full text-end mt-8">
              <button
                disabled={method === ""}
                type="submit"
                className="bg-black text-white px-16 py-3 text-sm disabled:opacity-50 cursor-not-allowed"
              >
                สั่งซื้อสินค้า
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* QR Code Popup */}
      {showQRPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-center">
              ชำระเงินด้วย QR Code
            </h2>
            <div className="flex flex-col items-center">
              <img
                src={qrcodePaymentImage}
                alt="QR Code สำหรับชำระเงิน"
                className="w-64 h-64 object-contain mb-4"
              />
              <p className="mb-4 text-lg font-semibold">
                ยอดรวม: ฿ {getCartAmount() + delivery_fee}
              </p>
            </div>
            <div className="mb-4">
              <p className="mb-2 text-sm text-gray-600">อัพโหลดสลิป:</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                ref={fileInputRef}
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                เลือกไฟล์
              </button>
              {paymentProof && (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-green-600">
                    ไฟล์ที่อัพโหลด: {paymentProofFileName}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSlipPreview(true)}
                    className="text-black hover:text-gray-800 text-sm"
                  >
                    ตววจสอบการชำระเงิน
                  </button>
                </div>
              )}
            </div>
            {uploadProgress > 0 && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  กำลังอัพโหลด: {uploadProgress}%
                </p>
              </div>
            )}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setShowQRPopup(false);
                  setMethod("cod");
                  setUploadProgress(0);
                  clearFileUpload();
                }}
                className="px-6 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmQRPayment}
                disabled={isUploading}
                className={`px-6 py-2 bg-black text-white rounded-md transition-colors ${
                  isUploading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-800"
                }`}
              >
                {isUploading ? "กำลังอัพโหลด..." : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSlipPreview && paymentProof && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">สลิปการโอนเงิน</h2>
            <img
              src={URL.createObjectURL(paymentProof)}
              alt="สลิปการโอนเงิน"
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
            <button
              onClick={() => setShowSlipPreview(false)}
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

      {/* Modal เพิ่มที่อยู่ใหม่ */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full relative">
            <button
              onClick={() => setShowAddressForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
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

            <h2 className="text-xl font-bold mb-6 text-center">
              เพิ่มที่อยู่ใหม่
            </h2>
            <form onSubmit={handleAddAddress}>
              <div className="space-y-4">
                {/* ชื่อ-นามสกุล */}
                <div className="relative">
                  <input
                    required
                    className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="ชื่อ-นามสกุล"
                    value={newAddressData.name}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                {/* ที่อยู่บรรทัด 1 */}
                <div className="relative">
                  <input
                    required
                    className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="ที่อยู่บรรทัดที่ 1"
                    value={newAddressData.addressLine1}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        addressLine1: e.target.value,
                      })
                    }
                  />
                </div>

                {/* ที่อยู่บรรทัด 2 */}
                <div className="relative">
                  <input
                    className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="ที่อยู่บรรทัดที่ 2 (ถ้ามี)"
                    value={newAddressData.addressLine2}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        addressLine2: e.target.value,
                      })
                    }
                  />
                </div>

                {/* จังหวัด */}
                <div className="relative">
                  <input
                    required
                    className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="จังหวัด"
                    value={newAddressData.province}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        province: e.target.value,
                      })
                    }
                  />
                </div>

                {/* อำเภอ/เขต */}
                <div className="relative">
                  <input
                    required
                    className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="อำเภอ/เขต"
                    value={newAddressData.district}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        district: e.target.value,
                      })
                    }
                  />
                </div>

                {/* รหัสไปรษณีย์ */}
                <div className="relative">
                  <input
                    required
                    className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="รหัสไปรษณีย์"
                    value={newAddressData.postalCode}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        postalCode: e.target.value,
                      })
                    }
                  />
                </div>

                {/* ประเทศ */}
                <div className="relative">
                  <input
                    required
                    className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="ประเทศ"
                    value={newAddressData.country}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        country: e.target.value,
                      })
                    }
                  />
                </div>

                {/* เบอร์โทรศัพท์ */}
                <div className="relative">
                  <input
                    required
                    className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="เบอร์โทรศัพท์"
                    value={newAddressData.phoneNumber}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        phoneNumber: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-center space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="px-6 py-2.5 bg-gray-200 text-black rounded-md hover:bg-gray-300 transition duration-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black text-white rounded-md hover:bg-gray-800 transition duration-200"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PlaceOrder;
