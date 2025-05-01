import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Reportproblem = ({ token, searchQuery }) => {
  const [list, setList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolutionDetails, setResolutionDetails] = useState("");
  const [showResolutionModal, setShowResolutionModal] = useState(false);

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

  const updateResolution = async (id) => {
    try {
      const response = await axios.patch(
        backendUrl + `/api/reportproblem/${id}/resolution`,
        {
          resolutionDetails,
          status: "เสร็จสิ้น",
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setShowResolutionModal(false);
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
              <th className="py-2 px-4 border-b text-left">รูปภาพ</th>
              <th className="py-2 px-4 border-b text-left">ชื่อผู้แจ้ง</th>
              <th className="py-2 px-4 border-b text-left">รายละเอียด</th>
              <th className="py-2 px-4 border-b text-left">วันเวลาที่แจ้ง</th>
              <th className="py-2 px-4 border-b text-left">สถานะ</th>
              <th className="py-2 px-4 border-b text-left">
                รายละเอียดการแก้ไข
              </th>
              <th className="py-2 px-4 border-b text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item, index) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">
                  {item.problemImage && (
                    <img
                      src={item.problemImage}
                      alt="ปัญหา"
                      className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
                      onClick={() => setSelectedImage(item.problemImage)}
                    />
                  )}
                </td>
                <td className="py-2 px-4 border-b">{item.reporterName}</td>
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
                <td className="py-2 px-4 border-b">
                  {item.resolutionDetails ? (
                    <div className="max-w-xs">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm">{item.resolutionDetails}</p>
                        <button
                          onClick={() => {
                            setSelectedReport(item);
                            setResolutionDetails(item.resolutionDetails);
                            setShowResolutionModal(true);
                          }}
                          className="text-blue-500 hover:text-blue-700"
                          title="แก้ไขรายละเอียดการแก้ไข"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        แก้ไขเมื่อ:{" "}
                        {new Date(item.resolvedAt).toLocaleString("th-TH")}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedReport(item);
                        setResolutionDetails("");
                        setShowResolutionModal(true);
                      }}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      เพิ่มรายละเอียดการแก้ไข
                    </button>
                  )}
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

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={selectedImage}
              alt="ปัญหา"
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

      {showResolutionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">รายละเอียดการแก้ไขปัญหา</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รายละเอียดการแก้ไข
              </label>
              <textarea
                value={resolutionDetails}
                onChange={(e) => setResolutionDetails(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows="4"
                placeholder="กรอกรายละเอียดการแก้ไขปัญหา..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResolutionModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => updateResolution(selectedReport._id)}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Reportproblem;
