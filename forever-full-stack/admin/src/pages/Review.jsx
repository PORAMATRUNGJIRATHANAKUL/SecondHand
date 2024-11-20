import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const Review = ({ token, searchQuery }) => {
  // เพิ่ม searchQuery prop
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/review/");
      if (response.data.success) {
        setList(response.data.reviews.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeReview = async (id) => {
    try {
      const response = await axios.delete(backendUrl + `/api/review/${id}`, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // เพิ่มฟังก์ชันกรองข้อมูล
  const filteredList = list.filter((item) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase().trim();

    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.comment.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <p className="mb-2">รายการรีวิวทั้งหมด</p>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">ชื่อผู้รีวิว</th>
              <th className="py-2 px-4 border-b text-left">คะแนน</th>
              <th className="py-2 px-4 border-b text-left">ความคิดเห็น</th>
              <th className="py-2 px-4 border-b text-left">วันที่</th>
              <th className="py-2 px-4 border-b text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{item.name}</td>
                <td className="py-2 px-4 border-b">{item.rating}</td>
                <td className="py-2 px-4 border-b">{item.comment}</td>
                <td className="py-2 px-4 border-b">{item.date}</td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => {
                      if (window.confirm("คุณต้องการลบรีวิวนี้ใช่หรือไม่?")) {
                        removeReview(item._id);
                      }
                    }}
                    className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                    title="ลบรีวิว"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredList.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            ไม่พบรายการที่ค้นหา
          </div>
        )}
      </div>
    </>
  );
};

export default Review;
