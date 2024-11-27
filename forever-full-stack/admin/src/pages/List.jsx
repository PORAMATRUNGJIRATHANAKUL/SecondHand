import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({ token, searchQuery }) => {
  const [list, setList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
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
        backendUrl + "/api/product/removeAdmin",
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
      toast.error("เกิดข้อผิดพลาดในการลบสินค้า");
    }
  };

  // เพิ่มฟังก์ชันกรองข้อมูล
  const filteredList = list.filter((item) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower) ||
      (item.owner?.name || "").toLowerCase().includes(searchLower)
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown !== null && !event.target.closest(".col-span-2")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  return (
    <>
      <p className="mb-2">รายการสินค้าทั้งหมด</p>
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
                className="w-12 h-12 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                src={item.image[0]}
                alt={`รูปสินค้า ${item.name}`}
                onClick={() => setSelectedImage(item.image[0])}
              />
            </div>

            {/* ชื่อส้าน */}
            <div className="col-span-2 text-gray-600">
              {item.owner?.name || "-"}
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
            <div className="col-span-2 hidden md:flex items-center justify-center">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === index ? null : index)
                }
                className="px-3 py-1.5 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <span>รายละเอียด</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transition-transform ${
                    openDropdown === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Content */}
              {openDropdown === index && (
                <div className="absolute mt-2 bg-white border rounded-lg shadow-lg p-4 z-10">
                  {/* สี */}
                  <div className="mb-3">
                    <div className="text-sm font-semibold mb-2">สี:</div>
                    <div className="flex flex-wrap gap-2">
                      {item.colors.map((color, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <div
                            className={`w-6 h-6 rounded-full ${getColorClass(
                              color
                            )} shadow-sm`}
                          />
                          <span className="text-sm text-gray-600">
                            {getColorName(color)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ไซส์ */}
                  <div>
                    <div className="text-sm font-semibold mb-2">ไซส์:</div>
                    <div className="flex flex-wrap gap-2">
                      {item.sizes.map((size, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 rounded-md text-sm"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
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

      {/* Modal แสดงรูปภาพ */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={selectedImage}
              alt="รูปสินค้า"
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default List;
