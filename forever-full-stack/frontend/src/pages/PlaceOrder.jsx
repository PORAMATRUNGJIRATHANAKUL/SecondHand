import React, { useContext, useState, useRef } from "react";
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
  const [itemAddresses, setItemAddresses] = useState({});

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
    setSelectedProducts,
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
      if (!selectedAddress) {
        toast.error("กรุณาเลือกที่อยู่จัดส่ง");
        return;
      }

      // สรวจสอบว่าทุกสินค้ามีที่อยู่จัดส่ง
      const allItemsHaveAddress = cartItems.every(
        (item) => itemAddresses[item.productId] || selectedAddress
      );

      if (!allItemsHaveAddress) {
        toast.error("กรุณาเลือกที่อยู่จัดส่งสำหรับทุกสินค้า");
        return;
      }

      // สร้างรายการสินค้าที่จะส่งไป API
      const orderItems = selectedProducts.map((item, index) => {
        const product = products.find((p) => p._id === item.productId);
        if (!product) {
          throw new Error(`ไม่พบข้อมูลสินค้ารหัส ${item.productId}`);
        }

        // ใช้ที่อยู่เฉพาะของสินค้า หรือที่อยู่หลักถ้าไม่มีที่อยู่เฉพาะ
        const itemAddress = itemAddresses[index] || selectedAddress;

        return {
          _id: item.productId,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          size: item.size,
          colors: [item.color],
          owner: product.owner,
          shippingCost: product.shippingCost || 50,
          image: product.image?.[0] || product.images?.[0] || "",
          address: itemAddress,
        };
      });

      // คำนวณยอดรวมทั้งหมด
      const totalAmount = orderItems.reduce(
        (sum, item) => sum + (item.price * item.quantity + item.shippingCost),
        0
      );

      let orderData = {
        items: orderItems,
        amount: totalAmount,
        paymentMethod: method,
        address: selectedAddress,
      };

      // ถรวจสอบวิธีการชำระเงิน
      if (method === "QR Code" && paymentProof) {
        const formData = new FormData();
        formData.append("paymentProof", paymentProof);

        // อัพโหลดหลักฐานการชำระเงินก่อน
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

        if (uploadResponse.data.success) {
          orderData.paymentProof = uploadResponse.data.paymentProofPath;
        } else {
          throw new Error("ไม่สามารถอัพโหลดหลักฐานการชำระเงินได้");
        }
      } else if (method === "Cash on Delivery") {
        // ไม่ต้องทำอะไรเพิ่มเติมสำหรับ COD
        orderData.paymentProof = null;
      }

      // ส่งคำสั่งซื้อ
      const response = await axios.post(
        `${backendUrl}/api/order/place`,
        orderData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("สั่งซื้อสินค้าสำเร็จ");
        setCartItems([]); // ล้างตะกร้าสินค้า
        navigate("/orders");
      } else {
        throw new Error(response.data.message || "เกิดข้อผิดพลาดในการสั่งซื้อ");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการสั่งซื้อ:", error);
      toast.error(error.message || "เกิดข้อผิดพลาดในการสั่งซื้อ");
    }
  };

  // ฟังก์ชันสำหรับจัดการการส่งฟอร์ม
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // เพิ่มการตรวจสอบที่อยู่
    if (!selectedAddress) {
      toast.error("กรุณาเลือกที่อยู่จัดส่ง");
      return;
    }

    // ตรวจสอบว่าทุกสินค้ามีที่อยู่จัดส่ง
    const allItemsHaveAddress = cartItems.every(
      (item) => itemAddresses[item.productId] || selectedAddress
    );

    if (!allItemsHaveAddress) {
      toast.error("กรุณาเลือกที่อยู่จัดส่งสำหรับทุกสินค้า");
      return;
    }

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

  const confirmQRPayment = async () => {
    try {
      // ตรวจสอบว่ามีหลักฐานการชำระเงินหรือไม่
      if (!paymentProof) {
        toast.error("กรุณาอัพโหลดหลักฐานการชำระเงิน");
        return;
      }

      // สร้าง FormData สำหรับส่งไฟล์
      const formData = new FormData();
      formData.append("paymentProof", paymentProof);
      formData.append("amount", totalAmount);

      // ยืนยันการชำระเงิน
      const verifyResponse = await axios.post(
        `${backendUrl}/api/order/verify-qr-payment`,
        formData,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (verifyResponse.data.success) {
        // ถ้ายืนยันสำเร็จ ทำการสั่งซื้อ
        await placeOrder();
      } else {
        throw new Error(verifyResponse.data.message);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการยืนยันการชำระเงิน:", error);
      toast.error(
        error.response?.data?.message || "เกิดข้อผิดพลาดในการยืนยันการชำระเงิน"
      );
    }
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      if (!item || typeof item.price !== "number") {
        console.warn("Invalid item found:", item);
        return total;
      }
      return total + item.price * (item.quantity || 1);
    }, 0);
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
            const initialItemAddresses = {};
            cartItems.forEach((item) => {
              initialItemAddresses[item.productId] = defaultAddress;
            });
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("ไม่สามารถดึงข้อมูลที่อยู่ได้");
      }
    };
    fetchAddresses();
  }, [backendUrl, token, cartItems]);

  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    if (editingAddressId) {
      handleUpdateAddress(editingAddressId);
    } else {
      handleAddAddress(e);
    }
  };

  const handleAddAddress = async () => {
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
    if (window.confirm("คุณต้องการลบที่อยู่นี้ใช่หรือไม่?")) {
      try {
        const response = await axios.delete(
          `${backendUrl}/api/user/address/${addressId}`,
          { headers: { token } }
        );
        if (response.data.success) {
          setAddresses(addresses.filter((addr) => addr._id !== addressId));
          if (selectedAddress?._id === addressId) {
            setSelectedAddress(null);
          }
          const newItemAddresses = { ...itemAddresses };
          Object.keys(newItemAddresses).forEach((key) => {
            if (newItemAddresses[key]?._id === addressId) {
              delete newItemAddresses[key];
            }
          });
          setItemAddresses(newItemAddresses);
          toast.success("ลบที่อยู่เรียบร้อย");
        }
      } catch (error) {
        console.error("Delete address error:", error);
        toast.error(
          error.response?.data?.message || "เกิดข้อผิดพลาดในการลบที่อยู่"
        );
      }
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

  const handleSelectAddress = (address, productIndex) => {
    setItemAddresses((prev) => ({
      ...prev,
      [productIndex]: address,
    }));
  };

  // ปรับปรุงการจัดการเมื่อคลิกเลือกที่อยู่จาก dropdown
  const handleAddressSelection = (address, productIndex) => {
    handleSelectAddress(address, productIndex);
    setIsAddressDropdownOpen(false);
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

        const newDefaultAddress = updatedAddresses.find(
          (addr) => addr._id === addressId
        );
        setSelectedAddress(newDefaultAddress);

        const newItemAddresses = { ...itemAddresses };
        cartItems.forEach((item) => {
          if (!newItemAddresses[item.productId]) {
            newItemAddresses[item.productId] = newDefaultAddress;
          }
        });
        setItemAddresses(newItemAddresses);

        toast.success("ตั้งค่าที่อยู่เริ่มต้นเรียบร้อย");
      }
    } catch (error) {
      console.error("Set default address error:", error);
      toast.error(
        error.response?.data?.message ||
          "เกิดข้อผิดพลาดในการตั้งค่าที่อยู่เริ่มต้น"
      );
    }
  };

  // ปรับปุ่งการจัดกลุมสินค้าตามร้านค้า
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

    // เพิ่มสินค้าและอัพเดทยอดรวม
    groups[storeId].items.push({ ...item, product });
    groups[storeId].totalItems += item.quantity;
    groups[storeId].totalAmount += product.price * item.quantity;
    // คำนวณค่าจัดส่งตามค่าจัดส่งของสินค้าแต่ละชิ้น
    groups[storeId].totalShipping +=
      (product.shippingCost || 0) * item.quantity;

    return groups;
  }, {});

  // เพิ่ม state สำหรับเก็บ ID ที่กำลังแก้ไข
  const [editingAddressId, setEditingAddressId] = useState(null);

  const handleEditAddress = (address) => {
    // เก็บ ID ที่กำลังแก้ไข
    setEditingAddressId(address._id);

    // เก็บข้อมูลที่อยู่เดิมลงใน state
    setNewAddressData({
      name: address.name,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      province: address.province,
      district: address.district,
      postalCode: address.postalCode,
      country: address.country || "ประเทศไทย",
      phoneNumber: address.phoneNumber,
    });

    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (editingAddressId) {
        // กรณีแก้ไขที่อยู่
        response = await axios({
          method: "put",
          url: `${backendUrl}/api/user/address/${editingAddressId}`,
          headers: {
            "Content-Type": "application/json",
            token,
          },
          data: newAddressData,
        });
      } else {
        // กรณีเพิ่มที่อยู่ใหม่
        console.log("Creating new address");
        response = await axios({
          method: "post",
          url: `${backendUrl}/api/user/address`,
          headers: {
            "Content-Type": "application/json",
            token,
          },
          data: newAddressData,
        });
      }

      if (response.data.success) {
        if (editingAddressId) {
          // อัพเดทข้อมูลในรายการที่อยู่
          setAddresses((prevAddresses) =>
            prevAddresses.map((addr) =>
              addr._id === editingAddressId ? response.data.address : addr
            )
          );

          // อัพเดทที่อยู่ที่เลือก
          if (selectedAddress?._id === editingAddressId) {
            setSelectedAddress(response.data.address);
          }

          // อัพเดทที่อยู่ในรายการสินค้า
          setItemAddresses((prev) => {
            const newAddresses = { ...prev };
            Object.keys(newAddresses).forEach((key) => {
              if (newAddresses[key]?._id === editingAddressId) {
                newAddresses[key] = response.data.address;
              }
            });
            return newAddresses;
          });

          toast.success("แก้ไขที่อยู่เรียบร้อย");
        } else {
          setAddresses((prev) => [...prev, response.data.address]);
          toast.success("เพิ่มที่อยู่เรียบร้อย");
        }

        // รีเซ็ตฟอร์มและสถานะ
        setShowAddressForm(false);
        setEditingAddressId(null);
        setNewAddressData({
          name: "",
          addressLine1: "",
          addressLine2: "",
          province: "",
          district: "",
          postalCode: "",
          country: "ประเทศไทย",
          phoneNumber: "",
        });
      }
    } catch (error) {
      console.error("Submit address error:", error);
      console.log("Error details:", {
        editingAddressId,
        newAddressData,
        errorResponse: error.response?.data,
      });
      toast.error(
        error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกที่อยู่"
      );
    }
  };

  // Add new state for QR code verification
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

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
                    ({ product, size, color, quantity }, index) => (
                      <div
                        key={`${product._id}-${size}-${color}`}
                        className="p-6 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="flex flex-col lg:flex-row gap-8">
                          {/* Product Info - Left Side */}
                          <div className="flex gap-6 flex-1">
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

                              {/* Address section moved here and simplified */}
                              <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="text-sm font-medium text-gray-700">
                                    ที่อยู่จัดส่ง
                                  </h5>
                                  <button
                                    onClick={() =>
                                      setIsAddressDropdownOpen(index)
                                    }
                                    className="p-1 rounded-full hover:bg-blue-50 transition-colors duration-200"
                                  >
                                    <svg
                                      className="w-5 h-5 text-blue-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                    </svg>
                                  </button>
                                </div>

                                {itemAddresses[index] ? (
                                  <div className="text-sm text-gray-600">
                                    <p className="font-medium">
                                      {itemAddresses[index].name}
                                    </p>
                                    <p>{itemAddresses[index].addressLine1}</p>
                                    {itemAddresses[index].addressLine2 && (
                                      <p>{itemAddresses[index].addressLine2}</p>
                                    )}
                                    <p>
                                      จ.{itemAddresses[index].district}, อ.
                                      {itemAddresses[index].province}
                                    </p>
                                    <p>{itemAddresses[index].postalCode}</p>
                                    <p>
                                      โทร: {itemAddresses[index].phoneNumber}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="text-sm text-red-500">
                                    กรุณาเลือกที่อยู่จัดส่ง
                                  </div>
                                )}
                              </div>

                              {/* รายละเอียดสินค้า */}
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
                                    <span className="text-gray-700">
                                      {color}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Product Details */}
                              <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between items-center text-gray-600">
                                  <span>ราคาสินค้า ({quantity} ชิ้น)</span>
                                  <span>
                                    ฿
                                    {(
                                      product.price * quantity
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                  <span>ค่าจัดส่ง ({quantity} ชิ้น)</span>
                                  <span>
                                    ฿
                                    {(
                                      (product.shippingCost || 0) * quantity
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center font-medium text-gray-900 border-t pt-2">
                                  <span>รวมทั้งสิ้น</span>
                                  <span>
                                    ฿
                                    {(
                                      (product.price +
                                        (product.shippingCost || 0)) *
                                      quantity
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Shipping Address - Right Side */}
                          <div className="flex items-center gap-4">
                            {/* Address Selection Popup */}
                            {isAddressDropdownOpen === index && (
                              <div
                                className="fixed inset-0 z-50 overflow-y-auto"
                                aria-labelledby="modal-title"
                                role="dialog"
                                aria-modal="true"
                              >
                                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                  {/* Background overlay */}
                                  <div
                                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                                    aria-hidden="true"
                                    onClick={() =>
                                      setIsAddressDropdownOpen(false)
                                    }
                                  ></div>

                                  {/* Modal panel */}
                                  <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                      <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                          <h3
                                            className="text-lg leading-6 font-medium text-gray-900 mb-4"
                                            id="modal-title"
                                          >
                                            เลือกที่อยู่จัดส่ง
                                          </h3>
                                          <div className="mt-2 space-y-3">
                                            {addresses.map((address) => (
                                              <div
                                                key={address._id}
                                                className="relative flex items-start p-4 rounded-lg border hover:border-blue-500 transition-colors duration-200"
                                                onClick={() =>
                                                  handleAddressSelection(
                                                    address,
                                                    index
                                                  )
                                                }
                                              >
                                                <div className="flex-1">
                                                  <div className="flex items-center justify-between mb-2">
                                                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                      {address.name}
                                                      {address.isDefault && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                          ค่าเริ่มต้น
                                                        </span>
                                                      )}
                                                    </p>
                                                    {(itemAddresses[product._id]
                                                      ?._id === address._id ||
                                                      (!itemAddresses[
                                                        product._id
                                                      ] &&
                                                        selectedAddress?._id ===
                                                          address._id)) && (
                                                      <svg
                                                        className="w-5 h-5 text-blue-600"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                      >
                                                        <path
                                                          fillRule="evenodd"
                                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                          clipRule="evenodd"
                                                        />
                                                      </svg>
                                                    )}
                                                  </div>
                                                  <div className="text-sm text-gray-600">
                                                    <p>
                                                      {address.addressLine1}
                                                    </p>
                                                    {address.addressLine2 && (
                                                      <p>
                                                        {address.addressLine2}
                                                      </p>
                                                    )}
                                                    <p>
                                                      จ.{address.district}, อ.
                                                      {address.province}{" "}
                                                      {address.postalCode}
                                                    </p>
                                                    <p>
                                                      โทร: {address.phoneNumber}
                                                    </p>
                                                  </div>

                                                  {/* Address Actions */}
                                                  <div className="mt-3 flex items-center gap-3">
                                                    {!address.isDefault && (
                                                      <button
                                                        onClick={() => {
                                                          handleSetDefaultAddress(
                                                            address._id
                                                          );
                                                          handleSelectAddress(
                                                            address,
                                                            product._id
                                                          );
                                                          setIsAddressDropdownOpen(
                                                            false
                                                          );
                                                        }}
                                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                                      >
                                                        <svg
                                                          className="w-4 h-4"
                                                          fill="none"
                                                          stroke="currentColor"
                                                          viewBox="0 0 24 24"
                                                        >
                                                          <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M5 13l4 4L19 7"
                                                          />
                                                        </svg>
                                                        ตั้งเป็นค่าเริ่มต้น
                                                      </button>
                                                    )}
                                                    <button
                                                      onClick={() => {
                                                        handleEditAddress(
                                                          address
                                                        );
                                                        setShowAddressForm(
                                                          true
                                                        );
                                                        setIsAddressDropdownOpen(
                                                          false
                                                        );
                                                      }}
                                                      className="text-sm text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1"
                                                    >
                                                      <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                      >
                                                        <path
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          strokeWidth="2"
                                                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                        />
                                                      </svg>
                                                      แก้ไข
                                                    </button>
                                                    <button
                                                      onClick={() =>
                                                        handleDeleteAddress(
                                                          address._id
                                                        )
                                                      }
                                                      className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                                    >
                                                      <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                      >
                                                        <path
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          strokeWidth="2"
                                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                      </svg>
                                                      ลบ
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>

                                          {/* Add New Address Button */}
                                          <button
                                            onClick={() => {
                                              setEditingAddressId(null);
                                              setShowAddressForm(true);
                                              setIsAddressDropdownOpen(false);
                                            }}
                                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
                                          >
                                            <svg
                                              className="w-5 h-5"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 4v16m8-8H4"
                                              />
                                            </svg>
                                            เพิ่มที่อยู่ใหม่
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                      <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                                        onClick={() =>
                                          setIsAddressDropdownOpen(false)
                                        }
                                      >
                                        ปิด
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
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

            {/* Payment Method Section - ลบส่วนที่อยู่จัดส่งออก */}
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
                      setPaymentProof(null); // Reset payment proof when switching to COD
                    }}
                    className="h-4 w-4 text-blue-600"
                    disabled={!selectedAddress}
                  />
                  <label
                    htmlFor="cod"
                    className={`ml-3 ${
                      !selectedAddress ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
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
                    disabled={!selectedAddress}
                  />
                  <label
                    htmlFor="qr"
                    className={`ml-3 ${
                      !selectedAddress ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    QR Code
                  </label>
                </div>

                {/* Show QR Code section when QR payment is selected */}
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

              {!selectedAddress && (
                <div className="mt-4 text-sm text-red-500">
                  * กรุณาเลือกที่อยู่จัดส่งก่อนเลือกวิธีการชำระเงิน
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={onSubmitHandler}
              disabled={!selectedAddress || !method}
              className={`w-full py-3 px-4 rounded-lg transition-colors duration-200 ${
                selectedAddress && method
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {!selectedAddress
                ? "กรุณาเลือกที่อยู่จัดส่ง"
                : !method
                ? "กรุณาเลือกวิธีการชำระเงิน"
                : "ยืนยันคำสั่งซื้อ"}
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Popup */}
      {showQRPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                สแกน QR Code เพื่อชำระเงิน
              </h3>
              <button
                onClick={() => {
                  setShowQRPopup(false);
                  clearFileUpload();
                }}
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

            <div className="space-y-4">
              <img
                src={qrcodePaymentImage}
                alt="QR Code"
                className="w-full max-w-xs mx-auto"
              />
              <p className="text-center text-gray-600">
                สแกน QR Code เพื่อชำระเงินจำนวน{" "}
                <span className="font-semibold">
                  {currency}
                  {(getCartAmount() + delivery_fee).toLocaleString()}
                </span>
              </p>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">
                  อัพโหลดสลิปการโอนเงิน:
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <div className="flex gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 text-sm"
                  >
                    แนบสลิป
                  </button>
                  {paymentProof && (
                    <button
                      onClick={() => setShowSlipPreview(true)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      ดูสลิป
                    </button>
                  )}
                </div>
                {isUploading && (
                  <div className="mt-4">
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
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingAddressId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}
              </h3>
              <button
                onClick={() => {
                  setShowAddressForm(false);
                  resetForm();
                }}
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

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  value={newAddressData.name}
                  onChange={(e) =>
                    setNewAddressData({
                      ...newAddressData,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ที่อยู่บรรทัดที่ 1
                </label>
                <input
                  type="text"
                  value={newAddressData.addressLine1}
                  onChange={(e) =>
                    setNewAddressData({
                      ...newAddressData,
                      addressLine1: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ที่อยู่บรรทัดที่ 2
                </label>
                <input
                  type="text"
                  value={newAddressData.addressLine2}
                  onChange={(e) =>
                    setNewAddressData({
                      ...newAddressData,
                      addressLine2: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    จังหวัด
                  </label>
                  <input
                    type="text"
                    value={newAddressData.province}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        province: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    อำเภอ/เขต
                  </label>
                  <input
                    type="text"
                    value={newAddressData.district}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        district: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  รหัสไปรษณีย์
                </label>
                <input
                  type="text"
                  value={newAddressData.postalCode}
                  onChange={(e) =>
                    setNewAddressData({
                      ...newAddressData,
                      postalCode: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  value={newAddressData.phoneNumber}
                  onChange={(e) =>
                    setNewAddressData({
                      ...newAddressData,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                บันทึกที่อยู่
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;
