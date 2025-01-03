import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

const Sidebar = () => {
  return (
    <div className="w-[18%] min-h-screen border-r-2">
      <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">
        <NavLink
          className={({ isActive }) => `
            flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l
            hover:bg-gray-50 transition-colors
            ${isActive ? "bg-gray-100" : ""}
          `}
          to="/list"
        >
          <img
            className="w-5 h-5"
            src={assets.order_icon}
            alt="ไอคอนรายการสินค้า"
          />
          <p className="hidden md:block">รายการสินค้า</p>
        </NavLink>

        <NavLink
          className={({ isActive }) => `
            flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l
            hover:bg-gray-50 transition-colors
            ${isActive ? "bg-gray-100" : ""}
          `}
          to="/bank"
        >
          <img
            className="w-5 h-5"
            src={assets.bank_icon}
            alt="ไอคอนบัญชีร้าน"
          />
          <p className="hidden md:block">บัญชีร้านของแต่ละร้านค้า</p>
        </NavLink>

        <NavLink
          className={({ isActive }) => `
            flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l
            hover:bg-gray-50 transition-colors
            ${isActive ? "bg-gray-100" : ""}
          `}
          to="/orders"
        >
          <img
            className="w-5 h-5"
            src={assets.order_icon}
            alt="ไอคอนคำสั่งซื้อ"
          />
          <p className="hidden md:block">รายการสินค้าของแต่ละร้านค้า</p>
        </NavLink>

        <NavLink
          className={({ isActive }) => `
            flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l
            hover:bg-gray-50 transition-colors
            ${isActive ? "bg-gray-100" : ""}
          `}
          to="/review"
        >
          <img className="w-5 h-5" src={assets.review_icon} alt="ไอคอนรีวิว" />
          <p className="hidden md:block">รีวิว</p>
        </NavLink>
        <NavLink
          className={({ isActive }) => `
            flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l
            hover:bg-gray-50 transition-colors
            ${isActive ? "bg-gray-100" : ""}
          `}
          to="/issues"
        >
          <img
            className="w-5 h-5"
            src={assets.issue_icon}
            alt="ไอคอนแจ้งปัญหา"
          />
          <p className="hidden md:block">แจ้งปัญหา</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
