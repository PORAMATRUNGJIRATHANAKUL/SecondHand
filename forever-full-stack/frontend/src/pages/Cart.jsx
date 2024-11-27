import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
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
  const { products, currency, cartItems, updateQuantity, navigate } =
    useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.post("/api/cart/get");
        if (response.data.success) {
          const filteredCart = response.data.cart.filter(
            (item) => item.productId
          );
          setCartData(filteredCart);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    // fetchCart();
  }, []);

  const handleQuantityChange = (
    item,
    productData,
    newValue,
    isTyping = false
  ) => {
    if (isTyping && (newValue === "" || newValue === "0")) {
      updateQuantity(item.productId, item.size, 1);
      return;
    }

    const newQuantity = Number(newValue);

    if (isNaN(newQuantity) || newQuantity < 1) return;

    const stockItem = productData.stockItems.find(
      (stock) => stock.size === item.size && stock.color === item.color
    );

    if (!stockItem || newQuantity > stockItem.stock) {
      setModalMessage(
        `ไม่สามารถเพิ่มจำนวนสินค้าได้ เนื่องจากสินค้า ${
          productData.name
        } ไซส์ ${item.size} มีสินค้าคงเหลือเพียง ${stockItem?.stock || 0} ชิ้น`
      );
      setIsModalOpen(true);
      if (isTyping) {
        updateQuantity(item.productId, item.size, item.quantity);
      }
      return;
    }

    updateQuantity(item.productId, item.size, newQuantity);
  };

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <p className="text-gray-500">ตะกร้าสินค้า</p>
      </div>

      <div>
        {cartItems.map((item, index) => {
          const productData = products.find(
            (product) => product._id === item.productId
          );
          const stockItem = productData?.stockItems.find(
            (stock) => stock.size === item.size && stock.color === item.color
          );

          if (!productData) return null;

          return (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
            >
              <div className="flex items-start gap-6">
                <img
                  className="w-16 sm:w-20"
                  src={productData.image[0]}
                  alt={productData.name}
                />
                <div>
                  <p className="text-xs sm:text-lg font-medium">
                    {productData.name}
                  </p>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 mt-1">
                    {productData.owner?.profileImage ? (
                      <img
                        src={productData.owner.profileImage}
                        alt="Profile"
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    )}
                    <span>{productData.owner.name || "ไม่ระบุชื่อร้าน"}</span>
                  </div>
                  <div className="flex items-center gap-5 mt-2">
                    <p>
                      {currency}
                      {productData.price}
                    </p>
                    <p className="px-2 sm:px-3 sm:py-1 ">ไซส์: {item.size}</p>
                    <div className="flex items-center gap-2">
                      <p>สี:</p>
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-2">
                    สินค้าคงเหลือ: {stockItem?.stock || 0}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleQuantityChange(item, productData, item.quantity - 1)
                  }
                  className="w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-100"
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(
                      item,
                      productData,
                      e.target.value,
                      true
                    )
                  }
                  className="w-12 text-center border rounded-md px-1"
                  min="1"
                  max={stockItem?.stock || 1}
                />
                <button
                  onClick={() =>
                    handleQuantityChange(item, productData, item.quantity + 1)
                  }
                  className="w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-100"
                  disabled={item.quantity >= (stockItem?.stock || 1)}
                >
                  +
                </button>
              </div>
              <img
                onClick={() => updateQuantity(item.productId, item.size, 0)}
                className="w-4 mr-4 sm:w-5 cursor-pointer"
                src={assets.bin_icon}
                alt="ลบสินค้า"
              />
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={modalMessage}
      />

      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal />
          <div className="w-full text-end">
            <button
              onClick={() => navigate("/place-order")}
              className="bg-black text-white text-sm my-8 px-8 py-3"
            >
              ดำเนินการสั่งซื้อ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
