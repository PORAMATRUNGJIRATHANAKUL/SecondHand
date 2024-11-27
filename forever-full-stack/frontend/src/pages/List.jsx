import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

const List = ({ searchQuery }) => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [list, setList] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);

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

  const toggleDropdown = (itemId) => {
    setOpenDropdownId(openDropdownId === itemId ? null : itemId);
  };

  return (
    <>
      <p className="mb-2">รายการสินค้าของฉัน</p>
      <div className="flex flex-col gap-2">
        {/* หัวตาราง */}
        <div className="hidden md:grid grid-cols-12 gap-4 items-center py-3 px-4 bg-gray-100 rounded-t-lg font-semibold text-gray-700">
          <div className="col-span-1">รูปภาพ</div>
          <div className="col-span-2">ชื่อร้าน</div>
          <div className="col-span-2">ชื่อสินค้า</div>
          <div className="col-span-2">หมวดหมู่</div>
          <div className="col-span-1 text-right">ราคา</div>
          <div className="col-span-2 text-center">สี/ไซส์</div>
          <div className="col-span-1 text-center">คงเหลือ</div>
          <div className="col-span-1 text-center">จัดการ</div>
        </div>

        {/* รายการสินค้า */}
        {filteredList.map((item, index) => (
          <div
            key={index}
            className={`grid grid-cols-12 gap-4 items-center py-3 px-4 border-b hover:bg-gray-50 transition-colors ${
              index % 2 === 0 ? "bg-white" : "bg-gray-50"
            }`}
          >
            {/* รูปภาพ */}
            <div className="col-span-1 flex items-center">
              <img
                className="w-12 h-12 object-cover rounded-lg shadow-sm"
                src={item.image[0]}
                alt={`รูปสินค้า ${item.name}`}
              />
            </div>

            {/* ชื่อร้าน */}
            <div className="col-span-2 text-gray-600">
              {item.owner?.name || "ไม่ระบุ"}
            </div>

            {/* ชื่อสินค้า */}
            <div className="col-span-2 font-medium text-gray-800">
              {item.name}
            </div>

            {/* หมวดหมู่ */}
            <div className="col-span-2 text-gray-600">{item.category}</div>

            {/* ราคา */}
            <div className="col-span-1 text-right font-medium text-gray-800">
              {currency}
              {item.price.toLocaleString()}
            </div>

            {/* สี/ไซส์ */}
            <div className="col-span-2 hidden md:flex flex-col items-center justify-center relative">
              <button
                onClick={() => toggleDropdown(item._id)}
                className="px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                รายละเอียด
              </button>

              {openDropdownId === item._id && (
                <div className="absolute top-full mt-1 z-10 bg-white rounded-lg shadow-lg border p-3 min-w-[200px]">
                  {item.sizes.map((size) => (
                    <div key={size} className="mb-2">
                      <div className="font-medium mb-1">ไซส์ {size}</div>
                      {item.colors.map((color) => {
                        const stockItem = item.stockItems.find(
                          (stock) =>
                            stock.size === size && stock.color === color
                        );
                        const stockCount = stockItem ? stockItem.stock : 0;

                        return stockCount > 0 ? (
                          <div
                            key={`${size}-${color}`}
                            className="text-sm flex items-center gap-2 mb-1"
                          >
                            <div
                              className={`w-3 h-3 rounded-full ${getColorClass(
                                color
                              )}`}
                              title={getColorName(color)}
                            />
                            <span>
                              {getColorName(color)}: {stockCount}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* คงเหลือ */}
            <div className="col-span-1 text-center font-medium text-gray-800">
              {item.stockItems.reduce((stock, item) => stock + item.stock, 0)}
            </div>

            {/* ปุ่มลบ */}
            <div className="col-span-1 flex justify-center">
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
