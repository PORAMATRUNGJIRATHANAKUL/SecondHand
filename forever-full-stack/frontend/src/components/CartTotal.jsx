import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";

const CartTotal = () => {
  const { currency, delivery_fee, getCartAmount, cartItems } =
    useContext(ShopContext);

  return (
    <div className="w-full">
      <div className="text-2xl">
        <p className="text-gray-500">ยอดรวมในตะกร้า</p>
      </div>

      <div className="flex flex-col gap-2 mt-2 text-sm">
        <div className="flex justify-between">
          <p>ราคาสินค้า</p>
          <p>
            {currency} {getCartAmount().toLocaleString()}
          </p>
        </div>
        <hr />
        <div className="flex justify-between">
          <p>ค่าบริการ</p>
          <p>
            {currency} {delivery_fee.toLocaleString()}
          </p>
        </div>
        <hr />
        <div className="flex justify-between">
          <b>ยอดรวมทั้งหมด</b>
          <b>
            {currency}{" "}
            {(getCartAmount() === 0
              ? 0
              : getCartAmount() + delivery_fee
            ).toLocaleString()}
          </b>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
