import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Qrcode = ({ token, searchQuery }) => {
  // เพิ่ม searchQuery prop
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
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const verifyPayment = async (id) => {
    navigate("/orders");
    try {
      const response = await axios.post(
        backendUrl + `/api/order/verify-qr/${id}`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while verifying the payment"
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
      <h2 className="text-2xl font-bold mb-4">QR Code Payment List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Buyer</th>
              <th className="py-2 px-4 border-b text-left">Product Name</th>
              <th className="py-2 px-4 border-b text-left">Price</th>
              <th className="py-2 px-4 border-b text-left">Payment Slip</th>
              <th className="py-2 px-4 border-b text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{payment.buyer}</td>
                <td className="py-2 px-4 border-b">
                  {payment.productNames.join(", ")}
                </td>
                <td className="py-2 px-4 border-b">
                  {currency} {payment.price}
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => viewPaymentProof(payment)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2"
                  >
                    View QR Proof
                  </button>
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {!payment.payment && (
                    <button
                      onClick={() => verifyPayment(payment._id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* เพิ่มข้อความเมื่อไม่พบข้อมูล */}
        {filteredPayments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            ไม่พบรายการที่ค้นหา
          </div>
        )}
      </div>

      {selectedPayment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setSelectedPayment(null)}
        >
          <div
            className="bg-white p-6 rounded-lg max-w-2xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPayment(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
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

            <h2 className="text-xl font-bold mb-4">Slip Payment</h2>
            <img
              src={`${selectedPayment.paymentProof}`}
              alt="Payment Proof"
              className="max-w-[500px] max-h-[600px] object-contain mx-auto mb-4"
            />
            <div className="flex justify-end mt-4 mr-4">
              <button
                onClick={() => setSelectedPayment(null)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Qrcode;
