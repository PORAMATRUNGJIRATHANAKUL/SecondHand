import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price, owner }) => {
  const { currency } = useContext(ShopContext);

  return (
    <Link
      onClick={() => scrollTo(0, 0)}
      className="text-gray-700 cursor-pointer"
      to={`/product/${id}`}
    >
      <div className=" overflow-hidden">
        <img
          className="hover:scale-110 transition ease-in-out"
          src={image[0]}
          alt=""
        />
      </div>
      <p className="pt-3 pb-1 text-sm">{name}</p>
      <p className=" text-sm font-medium">
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
