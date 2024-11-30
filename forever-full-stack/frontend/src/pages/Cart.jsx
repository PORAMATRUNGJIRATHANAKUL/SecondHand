import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";

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
  } = useContext(ShopContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [selectedStores, setSelectedStores] = useState({});
  const [selectedItems, setSelectedItems] = useState({});

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
                  onClick={() => navigate("/place-order")}
                  className="w-full mt-8 bg-black text-white py-4 px-6 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 transform hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
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
    </div>
  );
};

export default Cart;
