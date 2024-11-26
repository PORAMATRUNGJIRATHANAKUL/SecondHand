import { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

function BankPage({ token, searchQuery }) {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/user/banks", {
        headers: { token },
      });
      if (response.data.success) {
        setList(response.data.banks.reverse());
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
      item.name.toLowerCase().includes(searchLower) ||
      item.bankName.toLowerCase().includes(searchLower) ||
      item.bankAccount.includes(searchLower) ||
      item.bankAccountName.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = async (userId) => {
    try {
      if (window.confirm("คุณต้องการลบข้อมูลธนาคารนี้ใช่หรือไม่?")) {
        const response = await axios.delete(
          `${backendUrl}/api/user/bank/${userId}`,
          { headers: { token } }
        );

        if (response.data.success) {
          toast.success("ลบข้อมูลธนาคารเรียบร้อย");
          fetchList();
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <>
      <p className="mb-2">รายการบัญชีธนาคารทั้งหมด</p>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">ชื่อร้าน</th>
              <th className="py-2 px-4 border-b text-left">ชื่อธนาคาร</th>
              <th className="py-2 px-4 border-b text-left">เลขบัญชีธนาคาร</th>
              <th className="py-2 px-4 border-b text-left">ชื่อบัญชี</th>
              <th className="py-2 px-4 border-b text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{item.name}</td>
                <td className="py-2 px-4 border-b">{item.bankName}</td>
                <td className="py-2 px-4 border-b">{item.bankAccount}</td>
                <td className="py-2 px-4 border-b">{item.bankAccountName}</td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                    title="ลบข้อมูลธนาคาร"
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
}

export default BankPage;
