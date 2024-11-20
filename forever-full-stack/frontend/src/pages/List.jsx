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

        {/* รายการสินค้า */}
        {filteredList.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
            key={index}
          >
            <img
              className="w-12"
              src={item.image[0]}
              alt={`รูปสินค้า ${item.name}`}
            />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>
              {currency}
              {item.price.toLocaleString()}
            </p>
            {/* ไซส์ */}
            <div className="hidden md:block">{item.sizes.join(", ")}</div>
            {/* สี */}
            <div className="hidden md:flex flex-wrap gap-1">
              {item.colors.map((color, idx) => (
                <div
                  key={idx}
                  className={`w-6 h-6 rounded-full ${getColorClass(color)}`}
                  title={getColorName(color)}
                />
              ))}
            </div>
            <button
              onClick={() => {
                if (window.confirm("คุณต้องการลบสินค้านี้ใช่หรือไม่?")) {
                  removeProduct(item._id);
                }
              }}
              className="text-right md:text-center cursor-pointer text-lg hover:text-red-500"
              title="ลบสินค้า"
              aria-label={`ลบสินค้า ${item.name}`}
            >
              ✕
            </button>
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
