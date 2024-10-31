import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import List from "./List";
import Ordershopme from "./Ordershopme";
import Qrcode from "./Qrcode";
import { ShopContext } from "../context/ShopContext";

const MyShop = () => {
  const { token, backendUrl } = useContext(ShopContext);
  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">ร้านค้าของฉัน</h1>
        <Link
          to="/add"
          className="px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition-colors"
        >
          + เพิ่มสินค้าใหม่
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="ค้นหา..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-2 px-1 ${
            activeTab === "products"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          }`}
        >
          สินค้าทั้งหมด
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-2 px-1 ${
            activeTab === "orders"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          }`}
        >
          รายการสั่งซื้อ
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-2 px-1 ${
            activeTab === "payments"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          }`}
        >
          การชำระเงิน
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === "products" && (
          <List token={token} searchQuery={searchQuery} />
        )}
        {activeTab === "orders" && (
          <Ordershopme token={token} searchQuery={searchQuery} />
        )}
        {activeTab === "payments" && (
          <Qrcode token={token} searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
};

export default MyShop;
