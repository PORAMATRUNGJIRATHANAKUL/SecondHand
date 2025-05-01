import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({
  id,
  image,
  name,
  price,
  owner,
  productCondition,
  conditionPercentage,
}) => {
  const { currency } = useContext(ShopContext);

  return (
    <Link
      onClick={() => scrollTo(0, 0)}
      className="text-gray-700 cursor-pointer"
      to={`/product/${id}`}
    >
      <div className="relative overflow-hidden">
        <img
          className="hover:scale-110 transition ease-in-out"
          src={image[0]}
          alt=""
        />
        {productCondition === "new" && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            สินค้าใหม่
          </div>
        )}
        {productCondition === "new_popular" && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            สินค้าใหม่ (ยอดนิยม)
          </div>
        )}
        {productCondition === "used" && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            สินค้ามือสอง
          </div>
        )}
        {productCondition === "used_popular" && (
          <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
            สินค้ามือสอง (ยอดนิยม)
          </div>
        )}
      </div>
      <p className="pt-3 pb-1 text-sm">
        {name}
        {(productCondition === "used" ||
          productCondition === "used_popular") && (
          <span className="text-gray-500 ml-1">
            (สภาพการใช้งาน {conditionPercentage}%)
          </span>
        )}
      </p>
      <p className="text-sm font-medium">
        {currency}
        {price}
      </p>
      <div className="flex items-center gap-1 text-sm text-gray-500">
        {owner?.profileImage ? (
          <img
            src={owner.profileImage}
            alt="Profile"
            className="w-4 h-4 rounded-full object-cover"
          />
        ) : (
          <div className="w-4 h-4 rounded-full bg-gray-300"></div>
        )}
        <span>{owner?.name || "ไม่ระบุร้านค้า"}</span>
      </div>
    </Link>
  );
};

export default ProductItem;
