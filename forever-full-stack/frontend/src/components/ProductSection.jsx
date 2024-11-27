import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";

const ProductSection = () => {
  const { products } = useContext(ShopContext);
  const [activeTab, setActiveTab] = useState("latest");
  const [displayProducts, setDisplayProducts] = useState([]);

  useEffect(() => {
    if (activeTab === "latest") {
      setDisplayProducts(products.slice(0, 10));
    } else {
      const bestProducts = products.filter((item) => item.bestseller);
      setDisplayProducts(bestProducts.slice(0, 5));
    }
  }, [products, activeTab]);

  return (
    <div className="-mt-1">
      <div className="text-center py-3">
        <div className="inline-flex gap-8 items-center mb-3 border-b border-gray-200 px-4">
          <button
            className={`text-sm sm:text-base text-gray-500 hover:text-gray-700 pb-2 px-4 transition-all hover:scale-105 ${
              activeTab === "latest"
                ? "font-medium border-b-2 border-gray-700 -mb-[1px]"
                : ""
            }`}
            onClick={() => setActiveTab("latest")}
          >
            สินค้ามาใหม่
          </button>
          <button
            className={`text-sm sm:text-base text-gray-500 hover:text-gray-700 pb-2 px-4 transition-all hover:scale-105 ${
              activeTab === "bestseller"
                ? "font-medium border-b-2 border-gray-700 -mb-[1px]"
                : ""
            }`}
            onClick={() => setActiveTab("bestseller")}
          >
            สินค้ายอดนิยม
          </button>
        </div>
        <p className="w-[85%] sm:w-3/4 m-auto text-xs sm:text-sm text-gray-600 mt-2 mb-4">
          {activeTab === "latest"
            ? "สินค้ามือสองคุณภาพดีที่เพิ่งลงขายในร้านค้าของเรา พร้อมให้คุณเลือกชมและเป็นเจ้าของ"
            : "สินค้ามือสองยอดนิยมที่ได้รับความนิยมจากผู้ซื้อ การันตีคุณภาพและความคุ้มค่า"}
        </p>
      </div>

      <div className="w-[85%] sm:w-3/4 h-auto m-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 gap-y-5 sm:gap-y-6">
        {displayProducts.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            name={item.name}
            image={item.image}
            price={item.price}
            owner={item.owner}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductSection;
