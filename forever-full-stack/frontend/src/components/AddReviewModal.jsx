// AddReviewModal.jsx
import { useState } from "react";
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const AddReviewModal = ({ isOpen, onClose, product }) => {
  const { backendUrl, token } = useContext(ShopContext);
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = async () => {
    if (!comment || !rating) return;

    try {
      const formData = new FormData();
      formData.append("comment", comment);
      formData.append("productId", product._id);
      formData.append("rating", rating);

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/addReview",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("เพิ่มรีวิวสำเร็จ");
      } else {
        toast.error("เกิดข้อผิดพลาดในการเพิ่มรีวิว");
      }

      onClose();
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการเพิ่มรีวิว");
    }
  };

  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded-md w-full max-w-2xl">
        <div className="py-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">รีวิวสินค้า</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>
        <textarea
          className="w-full border p-2 mb-4"
          rows="4"
          placeholder="Your comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="flex items-center gap-2 mb-2">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`cursor-pointer text-2xl ${
                rating > i ? "text-yellow-500" : "text-gray-300"
              }`}
              onClick={() => setRating(i + 1)}
              title={
                i === 4
                  ? "ดีมาก"
                  : i === 3
                  ? "ดี"
                  : i === 2
                  ? "ปานกลาง"
                  : i === 1
                  ? "แย่"
                  : "แย่มาก"
              }
            >
              ★
            </span>
          ))}
          <span className="text-sm text-gray-500 ml-2">
            {rating === 5 && "(ดีมาก)"}
            {rating === 4 && "(ดี)"}
            {rating === 3 && "(ปานกลาง)"}
            {rating === 2 && "(แย่)"}
            {rating === 1 && "(แย่มาก)"}
          </span>
        </div>

        <div className="mb-4">
          <div className="bg-white">
            <h2 className="text-lg font-medium mb-4">รูปภาพสินค้า</h2>
            <p className="text-sm text-gray-500 mb-4">
              <p>• ขนาดไฟล์: ไม่เกิน 5MB ต่อรูป</p>
              <p>• ไฟล์ที่รองรับ: JPG, PNG, WEBP</p>
            </p>

            <div className="flex flex-wrap gap-4">
              {[
                { state: image1, setState: setImage1 },
                { state: image2, setState: setImage2 },
                { state: image3, setState: setImage3 },
                { state: image4, setState: setImage4 },
              ].map((image, index) => (
                <label
                  key={index}
                  htmlFor={`image${index + 1}`}
                  className="relative cursor-pointer group"
                >
                  <img
                    className="w-32 h-32 object-cover rounded-lg border-2 border-dashed border-gray-300 group-hover:border-blue-500 transition-colors"
                    src={
                      !image.state
                        ? assets.upload_area
                        : URL.createObjectURL(image.state)
                    }
                    alt=""
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>เลือกรูปภาพ</span>
                  </div>
                  <input
                    onChange={(e) => image.setState(e.target.files[0])}
                    type="file"
                    id={`image${index + 1}`}
                    accept="image/*"
                    hidden
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="mr-2">
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={!comment || !rating}
            className="bg-neutral-900 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default AddReviewModal;
