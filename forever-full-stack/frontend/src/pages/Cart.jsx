import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } =
    useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const itemId in cartItems) {
        for (const size in cartItems[itemId]) {
          if (cartItems[itemId][size] > 0) {
            const productData = products.find(
              (product) => product._id === itemId
            );
            const color = productData.colors[0];

            tempData.push({
              _id: itemId,
              size: size,
              color: color,
              quantity: cartItems[itemId][size],
            });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <p className="text-gray-500">ตะกร้าสินค้า</p>
      </div>

      <div>
        {cartData.map((item, index) => {
          const productData = products.find(
            (product) => product._id === item._id
          );

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
                    สินค้าคงเหลือ:{" "}
                    {productData.stockItems.find(
                      (stock) =>
                        stock.size === item.size && stock.color === item.color
                    )?.stock || 0}
                  </div>
                </div>
              </div>
              <input
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || value === "0") return;
                  updateQuantity(item._id, item.size, Number(value));
                }}
                className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                type="number"
                min={1}
                defaultValue={item.quantity}
                aria-label="จำนวนสินค้า"
              />
              <img
                onClick={() => updateQuantity(item._id, item.size, 0)}
                className="w-4 mr-4 sm:w-5 cursor-pointer"
                src={assets.bin_icon}
                alt="ลบสินค้า"
              />
            </div>
          );
        })}
      </div>

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
