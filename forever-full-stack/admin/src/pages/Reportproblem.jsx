import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Reportproblem = ({ token, searchQuery }) => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/reportproblem/", {
        headers: { token },
      });
      if (response.data.success) {
        setList(response.data.reports.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeProblem = async (id) => {
    try {
      const response = await axios.delete(
        backendUrl + `/api/reportproblem/${id}`,
        {
          headers: { token },
        }
      );

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

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await axios.patch(
        backendUrl + `/api/reportproblem/${id}/status`,
        { status: newStatus },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("อัพเดทสถานะเรียบร้อย");
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

  const filteredList = list.filter((item) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase().trim();
    return (
      item.reporterName.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <p className="mb-2">รายการแจ้งปัญหาทั้งหมด</p>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">ชื่อผู้แจ้ง</th>
              <th className="py-2 px-4 border-b text-left">รูปภาพ</th>
              <th className="py-2 px-4 border-b text-left">รายละเอียด</th>
              <th className="py-2 px-4 border-b text-left">วันเวลาที่แจ้ง</th>
              <th className="py-2 px-4 border-b text-left">สถานะ</th>
              <th className="py-2 px-4 border-b text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item, index) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{item.reporterName}</td>
                <td className="py-2 px-4 border-b">
                  {item.problemImage && (
                    <img
                      src={item.problemImage}
                      alt="ปัญหา"
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                </td>
                <td className="py-2 px-4 border-b">{item.description}</td>
                <td className="py-2 px-4 border-b">
                  {new Date(item.reportedAt).toLocaleString("th-TH")}
                </td>
                <td className="py-2 px-4 border-b">
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item._id, e.target.value)}
                    className="p-1 border rounded"
                  >
                    <option value="รอรับเรื่อง">รอรับเรื่อง</option>
                    <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                    <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                  </select>
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => {
                      if (window.confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) {
                        removeProblem(item._id);
                      }
                    }}
                    className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                    title="ลบรายการ"
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

export default Reportproblem;
