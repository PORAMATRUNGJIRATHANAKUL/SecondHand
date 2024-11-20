import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({ token, searchQuery }) => {
  const [list, setList] = useState([]);

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
      toast.error("เกิดข้อผิดพลาดในการลบสินค้า");
    }
  };

  // เพิ่มฟังก์ชันกรองข้อมูล
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
      <p className="mb-2">รายการสินค้าทั้งหมด</p>
      <div className="flex flex-col gap-2">
        {/* หัวข้อตาราง */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>รูปภาพ</b>
          <b>ชื่อสินค้า</b>
          <b>หมวดหมู่</b>
          <b>ราคา</b>
          <b>ไซส์</b>
          <b>สี</b>
          <b className="text-center">จัดการ</b>
        </div>

        {/* ------ Product List ------ */}
        {filteredList.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
            key={index}
          >
            <img className="w-12" src={item.image[0]} alt="" />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>
              {currency}
              {item.price}
            </p>
            {/* Sizes */}
            <div className="hidden md:block">{item.sizes.join(", ")}</div>
            {/* Colors */}
            <div className="hidden md:flex flex-wrap gap-1">
              {item.colors.map((color, idx) => (
                <div
                  key={idx}
                  className={`w-6 h-6 rounded-full ${getColorClass(color)}`}
                  title={getColorName(color)}
                />
              ))}
            </div>
            <p
              onClick={() => removeProduct(item._id)}
              className="text-right md:text-center cursor-pointer text-lg"
            >
              X
            </p>
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
