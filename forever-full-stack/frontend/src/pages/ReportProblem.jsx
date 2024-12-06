import React, { useState, useRef, useContext } from "react";
import { ShopContext } from "../context/ShopContext";

const ReportProblem = () => {
  const { createReportProblem } = useContext(ShopContext);
  const [formData, setFormData] = useState({
    problemImage: null,
    description: "",
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, problemImage: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, problemImage: null }));
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("problemImage", formData.problemImage);
      formDataToSend.append("description", formData.description);

      await createReportProblem(formDataToSend);

      alert("ส่งรายงานปัญหาเรียบร้อยแล้ว");
      // รีเซ็ตฟอร์ม
      setFormData({ problemImage: null, description: "" });
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">แจ้งปัญหา</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ชูปภาพ */}
        <div>
          <label className="block text-sm font-medium mb-2">
            รูปภาพปัญหา *
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required={!preview}
            className="w-full p-2 border rounded-md"
          />
          <p className="text-sm text-gray-500 mt-1">
            ขนาดไฟล์: ไม่เกิน 5MB ต่อรูป ไฟล์ที่รองรับ: JPG, PNG, WEBP
          </p>
          {preview && (
            <div className="flex items-center gap-4 mt-2">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 rounded-md"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-2 text-red-500 hover:text-red-700"
                title="ลบรูปภาพ"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* รายละเอียด */}
        <div>
          <label className="block text-sm font-medium mb-2">
            รายละเอียดปัญหา *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows="4"
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* ปุ่มส่ง - แก้ไขส่วนนี้ */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white py-2 px-8 rounded-md hover:bg-gray-800 disabled:bg-gray-400 text-sm"
          >
            {loading ? "กำลังส่ง..." : "ส่งรายงาน"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportProblem;
