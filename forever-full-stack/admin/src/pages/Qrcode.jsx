import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const Qrcode = ({ token }) => {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);

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
    try {
      const response = await axios.post(
        backendUrl + `/api/order/verify-qr/${id}`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchPayments();
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
            {payments.map((payment, index) => (
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
                    className="bg-black  text-white font-bold py-1 px-2 rounded mr-2"
                  >
                    View Slip
                  </button>
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {!payment.payment && (
                    <button
                      onClick={() => verifyPayment(payment._id)}
                      className="bg-black  text-white font-bold py-1 px-2 rounded"
                    >
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              className="w-full mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedPayment(null)}
                className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
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
