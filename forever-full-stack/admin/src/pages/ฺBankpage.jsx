import { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

function BankPage({ token, searchQuery }) {
  const [user, setUser] = useState(null);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rousnded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">ข้อมูลบัญชีธนาคาร</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            ชื่อร้าน
          </label>
          <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
            {user?.name || "Famshop"}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            ชื่อธนาคาร
          </label>
          <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
            {user?.bankName || "กสิกรไทย"}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            เลขบัญชีธนาคาร
          </label>
          <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
            {user?.bankAccount || "8202934003"}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            ชื่อบัญชี
          </label>
          <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
            {user?.bankAccountName || "ปรเมศวร์ รุ่งจิรธนกุล"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BankPage;
