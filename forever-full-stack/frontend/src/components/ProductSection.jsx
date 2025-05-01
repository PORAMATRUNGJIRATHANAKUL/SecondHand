import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";

const ProductSection = () => {
  const { products } = useContext(ShopContext);
  const [activeTab, setActiveTab] = useState("new");
  const [displayProducts, setDisplayProducts] = useState([]);

  useEffect(() => {
    if (activeTab === "new") {
      // Show new products (both regular new and new_popular)
      const newProducts = products.filter(
        (item) =>
          item.productCondition === "new" ||
          item.productCondition === "new_popular"
      );
      setDisplayProducts(newProducts.slice(0, 10));
    } else if (activeTab === "bestseller") {
      // Show bestseller products (only new_popular and used_popular)
      const bestProducts = products.filter(
        (item) =>
          item.productCondition === "new_popular" ||
          item.productCondition === "used_popular"
      );
      setDisplayProducts(bestProducts.slice(0, 10));
    } else if (activeTab === "used") {
      // Show used products (both regular used and used_popular)
      const usedProducts = products.filter(
        (item) =>
          item.productCondition === "used" ||
          item.productCondition === "used_popular"
      );
      setDisplayProducts(usedProducts.slice(0, 10));
    }
  }, [products, activeTab]);

  return (
    <div className="-mt-1">
      <div className="text-center py-3">
        <div className="inline-flex gap-8 items-center mb-3 border-b border-gray-200 px-4">
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
          <button
            className={`text-sm sm:text-base text-gray-500 hover:text-gray-700 pb-2 px-4 transition-all hover:scale-105 ${
              activeTab === "used"
                ? "font-medium border-b-2 border-gray-700 -mb-[1px]"
                : ""
            }`}
            onClick={() => setActiveTab("used")}
          >
            สินค้ามือสอง
          </button>
          <button
            className={`text-sm sm:text-base text-gray-500 hover:text-gray-700 pb-2 px-4 transition-all hover:scale-105 ${
              activeTab === "new"
                ? "font-medium border-b-2 border-gray-700 -mb-[1px]"
                : ""
            }`}
            onClick={() => setActiveTab("new")}
          >
            สินค้าใหม่
          </button>
        </div>
        <p className="w-[85%] sm:w-3/4 m-auto text-xs sm:text-sm text-gray-600 mt-2 mb-4">
          {activeTab === "new"
            ? "สินค้าใหม่คุณภาพดีที่เพิ่งลงขายในร้านค้าของเรา พร้อมให้คุณเลือกชมและเป็นเจ้าของ"
            : activeTab === "bestseller"
            ? "สินค้ายอดนิยมที่ได้รับความนิยมจากผู้ซื้อ การันตีคุณภาพและความคุ้มค่า"
            : "สินค้ามือสองคุณภาพดี ราคาประหยัด มีให้เลือกหลากหลายประเภท พร้อมรับประกันความพึงพอใจ"}
        </p>
      </div>

      <div className="w-[85%] sm:w-3/4 h-auto m-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 gap-y-5 sm:gap-y-6 mb-16">
        {displayProducts.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            name={item.name}
            image={item.image}
            price={item.price}
            owner={item.owner}
            productCondition={item.productCondition}
            conditionPercentage={item.conditionPercentage}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductSection;
