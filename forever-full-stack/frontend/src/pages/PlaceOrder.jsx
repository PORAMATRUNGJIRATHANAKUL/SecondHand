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

const { currency } = assets;

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

  const groupedByStore = cartItems.reduce((groups, item) => {
    const product = products.find((p) => p._id === item.productId);
    if (!product) return groups;

    const storeId = product.owner?._id || "unknown";
    if (!groups[storeId]) {
      groups[storeId] = {
        storeId,
        storeName: product.owner?.name || "ไม่ระบุชื่อร้าน",
        storeImage: product.owner?.profileImage,
        items: [],
      };
    }

    groups[storeId].items.push({ ...item, product });
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ยืนยันคำสั่งซื้อ
          </h1>
          <p className="text-gray-600">
            กรุณาตรวจสอบรายการสินค้าและกรอกข้อมูลให้ครบถ้วน
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product List Section */}
          <div className="lg:col-span-2 space-y-8">
            {Object.values(groupedByStore).map((store) => (
              <div
                key={store.storeName}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {/* Store Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b">
                  <div className="flex items-center gap-3">
                    {store.storeImage ? (
                      <img
                        src={store.storeImage}
                        alt={store.storeName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-lg">
                          {store.storeName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="font-semibold text-gray-900">
                      {store.storeName}
                    </span>
                  </div>
                </div>

                {/* Store Products */}
                <div className="divide-y divide-gray-100">
                  {store.items.map(({ product, size, color, quantity }) => (
                    <div
                      key={`${product._id}-${size}-${color}`}
                      className="p-6"
                    >
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                          <img
                            src={product.image[0]}
                            alt={product.name}
                            className="w-28 h-28 object-cover rounded-lg shadow-sm"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {product.name}
                          </h3>
                          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                            <p className="font-medium text-gray-900">
                              {currency}
                              {product.price.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-2">
                              <span>ไซส์:</span>
                              <span className="font-medium">{size}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>สี:</span>
                              <div
                                className="w-6 h-6 rounded-full border shadow-sm"
                                style={{ backgroundColor: color }}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span>จำนวน:</span>
                              <span className="font-medium">{quantity}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Side - Address and Payment */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              {/* Address Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                {/* Existing address and payment sections */}
                {/* ... */}
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  สรุปคำสั่งซื้อ
                </h2>
                <CartTotal />
                <button
                  disabled={method === ""}
                  type="submit"
                  className="w-full mt-8 bg-black text-white py-4 px-6 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  สั่งซื้อสินค้า
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Existing modals */}
      {/* ... */}
    </div>
  );
};

export default PlaceOrder;
