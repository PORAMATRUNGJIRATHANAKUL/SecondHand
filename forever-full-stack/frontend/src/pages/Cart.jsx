import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

const Modal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">แจ้งเตือน</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    updateQuantity,
    navigate,
    deleteItemFromCart,
    setSelectedProducts,
    token,
    backendUrl,
  } = useContext(ShopContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [selectedStores, setSelectedStores] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const [itemAddresses, setItemAddresses] = useState({});
  const [editingAddressId, setEditingAddressId] = useState(null);
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

  const groupedByStore = cartItems.reduce((groups, item, index) => {
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

    groups[storeId].items.push({ ...item, index, product });
    return groups;
  }, {});

  const handleStoreSelect = (storeId) => {
    setSelectedStores((prev) => {
      const newState = { ...prev, [storeId]: !prev[storeId] };

      const store = groupedByStore[storeId];
      if (newState[storeId]) {
        store.items.forEach((item) => {
          setSelectedItems((prev) => ({ ...prev, [item.index]: true }));
        });
      } else {
        store.items.forEach((item) => {
          setSelectedItems((prev) => ({ ...prev, [item.index]: false }));
        });
      }

      return newState;
    });
  };

  const handleItemSelect = (index, storeId) => {
    setSelectedItems((prev) => {
      const newState = { ...prev, [index]: !prev[index] };

      const store = groupedByStore[storeId];
      const allStoreItemsSelected = store.items.every(
        (item) => newState[item.index] !== false
      );

      setSelectedStores((prev) => ({
        ...prev,
        [storeId]: allStoreItemsSelected,
      }));

      setSelectedProducts(cartItems.filter((item, idx) => newState[idx]));

      return newState;
    });
  };

  const CartTotal = ({ selectedItems }) => {
    const { products, cartItems, currency } = useContext(ShopContext);

    const groupedByStore = cartItems.reduce((groups, item, index) => {
      if (!selectedItems[index]) return groups;

      const product = products.find((p) => p._id === item.productId);
      if (!product) return groups;

      const storeId = product.owner?._id || "unknown";
      if (!groups[storeId]) {
        groups[storeId] = {
          storeName: product.owner?.name || "ไม่ระบุชื่อร้าน",
          items: [],
        };
      }

      groups[storeId].items.push({
        ...item,
        product,
        subtotal: product.price * item.quantity,
        shippingCost: product.shippingCost * item.quantity,
      });

      return groups;
    }, {});

    const total = Object.values(groupedByStore).reduce((sum, store) => {
      const storeSubtotal = store.items.reduce(
        (total, item) => total + item.subtotal + item.shippingCost,
        0
      );
      return sum + storeSubtotal;
    }, 0);

    return (
      <div className="space-y-6">
        {Object.values(groupedByStore).map((store, index) => {
          const storeSubtotal = store.items.reduce(
            (total, item) => total + item.subtotal,
            0
          );
          const storeShipping = store.items.reduce(
            (total, item) => total + item.shippingCost,
            0
          );

          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="font-medium text-gray-900 mb-3 pb-2 border-b">
                {store.storeName}
              </div>

              {/* รายการสินค้าที่เลือก */}
              <div className="space-y-3">
                {store.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <img
                      src={item.product.image[0]}
                      alt={item.product.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">
                        {item.product.name}
                      </p>
                      <div className="flex items-center gap-2 text-gray-600 text-xs mt-1">
                        <span>ไซส์: {item.size}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span>สี:</span>
                          <div
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                        <span>•</span>
                        <span>จำนวน: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-gray-900">
                      {currency}
                      {(item.product.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* สรุปราคาของร้าน */}
              <div className="mt-3 pt-3 border-t space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>ราคาสินค้ารวม</span>
                  <span>
                    {currency}
                    {storeSubtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>ค่าจัดส่ง</span>
                  <span>
                    {currency}
                    {storeShipping.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-900">
                  <span>รวมทั้งหมด</span>
                  <span>
                    {currency}
                    {(storeSubtotal + storeShipping).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* สรุปราคารวมทั้งหมด */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600">ราคารวมทั้งหมด</p>
              <p className="text-xs text-gray-500 mt-1">รวมค่าจัดส่งแล้ว</p>
            </div>
            <p className="text-xl font-semibold text-gray-900">
              {currency}
              {total.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
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
              initialItemAddresses[item.index] = defaultAddress;
            });
            setItemAddresses(initialItemAddresses);
          }
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        toast.error("ไม่สามารถดึงข้อมูลที่อยู่ได้");
      }
    };

    if (token) {
      fetchAddresses();
    }
  }, [token, backendUrl]);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        const response = await axios.put(
          `${backendUrl}/api/user/address/${editingAddressId}`,
          newAddressData,
          { headers: { token } }
        );

        if (response.data.success) {
          const updatedAddress = response.data.address;
          setAddresses(
            addresses.map((addr) =>
              addr._id === editingAddressId ? updatedAddress : addr
            )
          );

          // อัพเดทที่อยู่ที่เลือกถ้าเป็นที่อยู่เดียวกัน
          if (selectedAddress?._id === editingAddressId) {
            setSelectedAddress(updatedAddress);
          }

          // อัพเดทที่อยู่ในรายการสินค้า
          const newItemAddresses = { ...itemAddresses };
          Object.keys(newItemAddresses).forEach((key) => {
            if (newItemAddresses[key]?._id === editingAddressId) {
              newItemAddresses[key] = updatedAddress;
            }
          });
          setItemAddresses(newItemAddresses);

          toast.success("แก้ไขที่อยู่สำเร็จ");
        }
      } else {
        const response = await axios.post(
          `${backendUrl}/api/user/address`,
          newAddressData,
          { headers: { token } }
        );

        if (response.data.success) {
          const newAddress = response.data.address;
          setAddresses([...addresses, newAddress]);

          // ถ้าเป็นที่อยู่แรก ให้ตั้งเป็นค่าเริ่มต้น
          if (addresses.length === 0) {
            setSelectedAddress(newAddress);
            const initialItemAddresses = {};
            cartItems.forEach((item) => {
              initialItemAddresses[item.index] = newAddress;
            });
            setItemAddresses(initialItemAddresses);
          }

          toast.success("เพิ่มที่อยู่สำเร็จ");
        }
      }
      setShowAddressForm(false);
      resetForm();
    } catch (error) {
      console.error("Error submitting address:", error);
      toast.error(
        error.response?.data?.message ||
          "เกิดข้อผิดพลาดในการ" +
            (editingAddressId ? "แก้ไข" : "เพิ่ม") +
            "ที่อยู่"
      );
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

          // ถ้าลบที่อยู่ที่เลือกอยู่ ให้เคลียร์การเลือก
          if (selectedAddress?._id === addressId) {
            setSelectedAddress(null);
          }

          // ลบที่อยู่ออกจากรายการสินค้า
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
        console.error("Error deleting address:", error);
        toast.error(
          error.response?.data?.message || "เกิดข้อผิดพลาดในการลบที่อยู่"
        );
      }
    }
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

        // อัพเดทที่อยู่เริ่มต้นในรายการสินค้าที่ยังไม่มีที่อยู่
        const newItemAddresses = { ...itemAddresses };
        cartItems.forEach((item) => {
          if (!newItemAddresses[item.index]) {
            newItemAddresses[item.index] = newDefaultAddress;
          }
        });
        setItemAddresses(newItemAddresses);

        toast.success("ตั้งค่าที่อยู่เริ่มต้นเรียบร้อย");
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error(
        error.response?.data?.message ||
          "เกิดข้อผิดพลาดในการตั้งค่าที่อยู่เริ่มต้น"
      );
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
      country: "ประเทศไทย",
      phoneNumber: "",
    });
    setEditingAddressId(null);
  };

  const handleSelectAddress = (index, address) => {
    setItemAddresses((prev) => ({
      ...prev,
      [index]: address,
    }));
    setIsAddressDropdownOpen(false);
  };

  const handleProceedToCheckout = () => {
    // ตรวจสอบว่ามีสินค้าที่เลือกหรือไม่
    const selectedProductsArray = cartItems.filter(
      (item, idx) => selectedItems[idx]
    );

    if (selectedProductsArray.length === 0) {
      toast.error("กรุณาเลือกสินค้าที่ต้องการสั่งซื้อ");
      return;
    }

    // ตรวจสอบว่าทุกสินค้ามีที่อยู่จัดส่ง
    const allItemsHaveAddress = selectedProductsArray.every((item, idx) => {
      return itemAddresses[idx] || selectedAddress;
    });

    if (!allItemsHaveAddress) {
      toast.error("กรุณาระบุที่อยู่จัดส่งสำหรับทุกสินค้า");
      return;
    }

    // เพิ่มที่อยู่จัดส่งให้กับสินค้าที่เลือก
    const selectedProductsWithAddresses = selectedProductsArray.map(
      (item, idx) => ({
        ...item,
        shippingAddress: itemAddresses[idx] || selectedAddress,
      })
    );

    console.log(
      "Selected products with addresses:",
      selectedProductsWithAddresses
    ); // เพิ่ม log
    setSelectedProducts(selectedProductsWithAddresses);
    navigate("/place-order");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ตะกร้าสินค้า
          </h1>
          <p className="text-gray-600">
            กรุณาตรวจสอบรายการสินค้าและเลือกสินค้าที่ต้องการสั่งซื้อ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product List Section */}
          <div className="lg:col-span-2 space-y-8">
            {Object.values(groupedByStore).map((store) => (
              <div
                key={store.storeName}
                className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                {/* Store Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedStores[store.storeId] || false}
                      onChange={() => handleStoreSelect(store.storeId)}
                      className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex items-center gap-3 flex-1">
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
                </div>

                {/* Store Products */}
                <div className="divide-y divide-gray-100">
                  {store.items.map(
                    ({ product, size, color, quantity, index }) => {
                      const stockItem = product?.stockItems.find(
                        (stock) => stock.size === size && stock.color === color
                      );

                      if (!product || !stockItem || stockItem.stock === 0)
                        return null;

                      return (
                        <div
                          key={index}
                          className="p-6 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="flex items-start gap-6">
                            <input
                              type="checkbox"
                              checked={selectedItems[index] || false}
                              onChange={() =>
                                handleItemSelect(index, store.storeId)
                              }
                              className="mt-1 w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
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
                              </div>
                              <div className="mt-4 flex items-center gap-6">
                                <div className="flex items-center bg-gray-50 rounded-lg border shadow-sm">
                                  <button
                                    onClick={() =>
                                      updateQuantity(index, quantity - 1)
                                    }
                                    disabled={quantity <= 1}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors duration-200"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) =>
                                      updateQuantity(
                                        index,
                                        parseInt(e.target.value)
                                      )
                                    }
                                    className="w-16 text-center bg-white border-x py-2"
                                    min="1"
                                    max={stockItem.stock}
                                  />
                                  <button
                                    onClick={() =>
                                      updateQuantity(index, quantity + 1)
                                    }
                                    disabled={quantity >= stockItem.stock}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors duration-200"
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  onClick={() => deleteItemFromCart(index)}
                                  className="text-red-500 hover:text-red-600 transition-colors duration-200"
                                >
                                  <img
                                    src={assets.bin_icon}
                                    alt="ลบ"
                                    className="w-6 h-6"
                                  />
                                </button>
                              </div>
                              <p className="mt-2 text-sm text-gray-500">
                                สินค้าคงเหลือ: {stockItem.stock} ชิ้น
                              </p>
                              <div className="mt-4 flex items-center gap-4">
                                <button
                                  onClick={() =>
                                    setIsAddressDropdownOpen(index)
                                  }
                                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
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
                                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                  </svg>
                                  <div className="text-sm">
                                    {itemAddresses[index] ? (
                                      <div className="text-left">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">
                                            {itemAddresses[index].name}
                                          </span>
                                          {itemAddresses[index].isDefault && (
                                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                                              ค่าเริ่มต้น
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-gray-600">
                                          {itemAddresses[index].phoneNumber}
                                        </p>
                                        <p className="text-gray-600">
                                          {itemAddresses[index].addressLine1}
                                        </p>
                                        {itemAddresses[index].addressLine2 && (
                                          <p className="text-gray-600">
                                            {itemAddresses[index].addressLine2}
                                          </p>
                                        )}
                                        <p className="text-gray-600">
                                          {itemAddresses[index].district}{" "}
                                          {itemAddresses[index].province}{" "}
                                          {itemAddresses[index].postalCode}
                                        </p>
                                      </div>
                                    ) : selectedAddress ? (
                                      <div className="text-left">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">
                                            {selectedAddress.name}
                                          </span>
                                          {selectedAddress.isDefault && (
                                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                                              ค่าเริ่มต้น
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-gray-600">
                                          {selectedAddress.phoneNumber}
                                        </p>
                                        <p className="text-gray-600">
                                          {selectedAddress.addressLine1}
                                        </p>
                                        {selectedAddress.addressLine2 && (
                                          <p className="text-gray-600">
                                            {selectedAddress.addressLine2}
                                          </p>
                                        )}
                                        <p className="text-gray-600">
                                          {selectedAddress.district}{" "}
                                          {selectedAddress.province}{" "}
                                          {selectedAddress.postalCode}
                                        </p>
                                      </div>
                                    ) : (
                                      <span className="text-blue-600">
                                        + เพิ่มที่อยู่จัดส่ง
                                      </span>
                                    )}
                                  </div>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  สรุปคำสั่งซื้อ
                </h2>
                <CartTotal selectedItems={selectedItems} />
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full mt-8 bg-black text-white py-4 px-6 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200"
                >
                  ดำเนินการสั่งซื้อ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={modalMessage}
      />

      {/* Address Selection Dropdown */}
      {isAddressDropdownOpen !== false && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsAddressDropdownOpen(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    เลือกที่อยู่จัดส่ง
                  </h3>
                  <button
                    onClick={() => setIsAddressDropdownOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">ปิด</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
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
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => {
                        setItemAddresses((prev) => ({
                          ...prev,
                          [isAddressDropdownOpen]: address,
                        }));
                        setIsAddressDropdownOpen(false);
                      }}
                      className="relative flex flex-col p-6 border rounded-lg hover:border-blue-500 transition-colors duration-200 cursor-pointer hover:bg-gray-50"
                    >
                      {/* ส่วนหัวที่อยู่ */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-lg">
                              {address.name}
                            </span>
                            {address.isDefault && (
                              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                ค่าเริ่มต้น
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">
                            {address.phoneNumber}
                          </span>
                        </div>

                        {/* ปุ่มแก้ไขและลบ */}
                        <div className="flex items-center gap-4 text-gray-300">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAddressId(address._id);
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
                              setIsAddressDropdownOpen(false);
                            }}
                            className="text-sm hover:text-blue-600 transition-colors duration-200"
                          >
                            แก้ไข
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(address._id);
                            }}
                            className="text-sm hover:text-red-600 transition-colors duration-200"
                          >
                            ลบ
                          </button>
                        </div>
                      </div>

                      {/* รายละเอียดที่อยู่ */}
                      <div className="space-y-1 mb-4">
                        <p className="text-sm text-gray-600">
                          {address.addressLine1}
                        </p>
                        {address.addressLine2 && (
                          <p className="text-sm text-gray-600">
                            {address.addressLine2}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          {address.district} {address.province}{" "}
                          {address.postalCode}
                        </p>
                      </div>

                      {/* ปุ่มตั้งค่าเริ่มต้น */}
                      <div className="mt-auto pt-2 border-t border-gray-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefaultAddress(address._id);
                            setIsAddressDropdownOpen(false);
                          }}
                          className="text-sm text-gray-300 hover:text-blue-600 transition-colors duration-200"
                        >
                          ค่าเริ่มต้น
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setEditingAddressId(null);
                    resetForm();
                    setShowAddressForm(true);
                    setIsAddressDropdownOpen(false);
                  }}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
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
        </div>
      )}

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAddressId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}
              </h3>
              <button
                onClick={() => {
                  setShowAddressForm(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
                  ที่อยู่บรรทัดที่ 2 (ถ้ามี)
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

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                {editingAddressId ? "บันทึกการแก้ไข" : "เพิ่มที่อยู่"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
