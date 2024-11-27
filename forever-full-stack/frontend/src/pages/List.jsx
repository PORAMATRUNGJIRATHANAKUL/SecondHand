import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

const List = ({ searchQuery }) => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/owner", {
        headers: { token },
      });
      if (response.data.success) {
        setList(response.data.products.reverse());
      } else {
        toast.error("ไม่สามารถดึงข้อมูลสินค้าได้");
      }
    } catch (error) {
      console.log(error);
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("ลบสินค้าสำเร็จ");
        await fetchList();
      } else {
        toast.error("ไม่สามารถลบสินค้าได้");
      }
    } catch (error) {
      console.log(error);
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  // ฟังก์ชันกรองข้อมูล
  const filteredList = list.filter((item) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    fetchList();
  }, []);

  // ฟังก์ชันแปลงชื่อสีเป็นภาษาไทย
  const getColorName = (colorName) => {
    const colorNames = {
      Black: "ดำ",
      White: "ขาว",
      Gray: "เทา",
      Navy: "กรมท่า",
      Red: "แดง",
      Blue: "น้ำเงิน",
      Green: "เขียว",
      Yellow: "เหลือง",
      Purple: "ม่วง",
      Pink: "ชมพู",
      Orange: "ส้ม",
      Brown: "น้ำตาล",
      Beige: "เบจ",
    };
    return colorNames[colorName] || colorName;
  };

  // ฟังก์ชันแปลงชื่อสีเป็น Tailwind class
  const getColorClass = (colorName) => {
    const colorMap = {
      Black: "bg-black",
      White: "bg-white border border-gray-300",
      Gray: "bg-gray-500",
      Navy: "bg-blue-900",
      Red: "bg-red-500",
      Blue: "bg-blue-500",
      Green: "bg-green-500",
      Yellow: "bg-yellow-400",
      Purple: "bg-purple-500",
      Pink: "bg-pink-500",
      Orange: "bg-orange-500",
      Brown: "bg-amber-800",
      Beige: "bg-[#F5F5DC]",
    };
    return colorMap[colorName] || "bg-gray-200";
  };

  return (
    <>
      <p className="mb-2">รายการสินค้าของฉัน</p>
      <div className="flex flex-col gap-2">
        {/* หัวตาราง */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1.5fr_1.5fr_1fr_1fr_1fr_1fr_0.8fr] gap-4 items-center py-3 px-4 bg-gray-100 rounded-t-lg font-semibold text-gray-700">
          <div>รูปภาพ</div>
          <div>ชื่อร้าน</div>
          <div>ชื่อสินค้า</div>
          <div>หมวดหมู่</div>
          <div className="text-right">ราคา</div>
          <div className="text-center">สี/ไซส์</div>
          <div className="text-center">คงเหลือ</div>
          <div className="text-center">จัดการ</div>
        </div>

        {/* รายการสินค้า */}
        {filteredList.map((item, index) => (
          <div
            key={index}
            className={`grid grid-cols-[1fr_3fr_1.5fr_1.5fr_1fr_1fr_1fr_1fr_0.8fr] gap-4 items-center py-3 px-4 border-b hover:bg-gray-50 transition-colors ${
              index % 2 === 0 ? "bg-white" : "bg-gray-50"
            }`}
          >
            {/* รูปภาพ */}
            <div className="flex items-center">
              <img
                className="w-12 h-12 object-cover rounded-lg shadow-sm"
                src={item.image[0]}
                alt={`รูปสินค้า ${item.name}`}
              />
            </div>

            {/* ชื่อร้าน */}
            <div className="text-gray-600">{item.owner?.name || "ไม่ระบุ"}</div>

            {/* ชื่อสินค้า */}
            <div className="font-medium text-gray-800">{item.name}</div>

            {/* หมวดหมู่ */}
            <div className="text-gray-600">{item.category}</div>

            {/* ราคา */}
            <div className="text-right font-medium text-gray-800">
              {currency}
              {item.price.toLocaleString()}
            </div>

            {/* ไซส์ */}
            <div className="hidden md:flex flex-col items-center justify-center gap-1">
              {item.sizes.map((size) => (
                <div key={size} className="flex flex-col gap-1">
                  {item.colors.map((color) => {
                    const stockItem = item.stockItems.find(
                      (stock) => stock.size === size && stock.color === color
                    );
                    const stockCount = stockItem ? stockItem.stock : 0;

                    return stockCount > 0 ? (
                      <div
                        key={`${size}-${color}`}
                        className="text-sm flex items-center gap-1"
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${getColorClass(
                            color
                          )}`}
                          title={getColorName(color)}
                        />
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                          {size}: {stockCount}
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>
              ))}
            </div>

            {/* คงเหลือ */}
            <div className="text-center font-medium text-gray-800">
              {item.stockItems.reduce((stock, item) => stock + item.stock, 0)}
            </div>

            {/* ปุ่มลบ */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  if (window.confirm("คุณต้องการลบสินค้านี้ใช่หรือไม่?")) {
                    removeProduct(item._id);
                  }
                }}
                className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                title="ลบสินค้า"
                aria-label={`ลบสินค้า ${item.name}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {filteredList.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            ไม่พบสินค้าที่ค้นหา
          </div>
        )}
      </div>
    </>
  );
};

export default List;
