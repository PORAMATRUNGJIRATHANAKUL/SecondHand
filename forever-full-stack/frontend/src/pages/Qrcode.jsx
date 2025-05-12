import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const Qrcode = ({ searchQuery, setActiveTab }) => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const navigate = useNavigate();

  const fetchPayments = async () => {
    try {
      const response = await axios.get(
        backendUrl + "/api/order/qr-payment-list",
        {
          headers: { token },
        }
      );
      if (response.data.success) {
        setPayments(response.data.paymentList.reverse());
      } else {
        toast.error("ไม่สามารถดึงข้อมูลการชำระเงินได้");
      }
    } catch (error) {
      console.log(error);
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  const verifyPayment = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        {
          orderId: id,
          status: "รับออเดอร์แล้ว",
          payment: true,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("ยืนยันการชำระเงินสำเร็จ");
        setActiveTab("orders");
      } else {
        toast.error("ไม่สามารถยืนยันการชำระเงินได้");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "เกิดข้อผิดพลาดในการยืนยันการชำระเงิน"
      );
    }
  };

  const viewPaymentProof = (payment) => {
    setSelectedPayment(payment);
  };

  // เพิ่มฟังก์ชันกรองข้อมูล
  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase().trim();

    // ค้นหาจากชื่อผู้ซื้อ
    if (payment.buyer.toLowerCase().includes(searchLower)) return true;

    // ค้นหาจากชื่อสินค้า
    const hasMatchingProduct = payment.productNames.some((name) =>
      name.toLowerCase().includes(searchLower)
    );
    if (hasMatchingProduct) return true;

    return false;
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <>
      <p className="mb-2">รายการชำระเงินผ่าน QR Code</p>
      <div className="flex flex-col gap-2">
        {/* หัวข้อตาราง */}
        <div className="hidden md:grid grid-cols-[2fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>ผู้ซื้อ</b>
          <b>ชื่อสินค้า</b>
          <b>ราคา</b>
          <b>สลิป</b>
          <b className="text-center">จัดการ</b>
        </div>

        {/* รายการการชำระเงิน */}
        {filteredPayments.map((payment, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm hover:bg-gray-50"
          >
            <p>{payment.buyer}</p>
            <p>{payment.productNames.join(", ")}</p>
            <p>
              {currency} {payment.price.toLocaleString()}
            </p>
            <div>
              <button
                onClick={() => viewPaymentProof(payment)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                title="ดรวจสอบการชำระเงิน"
              >
                ตรวจสอบการชำระเงิน
              </button>
            </div>
            <div className="text-center">
              {!payment.payment && (
                <button
                  onClick={() => verifyPayment(payment._id)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm"
                  title="ยืนยันการชำระเงิน"
                >
                  ยืนยัน
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredPayments.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            ไม่พบรายการที่ค้นหา
          </div>
        )}
      </div>

      {/* Modal แสดงสลิป */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded-lg max-w-lg w-full">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">สลิปการโอนเงิน</h2>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-500 hover:text-gray-700"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-center items-center h-[400px]">
                <img
                  src={selectedPayment.paymentProof}
                  alt="สลิปการโอนเงิน"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.target.src = assets.noImage;
                    e.target.onerror = null;
                  }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  วันที่: {new Date(selectedPayment.date).toLocaleDateString()}
                </p>
                <p>จำนวนเงิน: ฿ {selectedPayment.price.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Qrcode;
