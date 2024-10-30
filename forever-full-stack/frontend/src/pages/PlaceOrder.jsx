import React, { useContext, useState, useRef, useCallback } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import qrcodePaymentImage from "../assets/qrcode_payment.png";
import { v4 as uuidv4 } from "uuid";
import { useEffect } from "react";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofFileName, setPaymentProofFileName] = useState(null);
  const fileInputRef = useRef(null);

  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const generateUniqueFileName = (originalFileName) => {
    const timestamp = new Date().getTime();
    const uniqueId = uuidv4().slice(0, 8);
    const fileExtension = originalFileName.split(".").pop();
    return `payment_proof_${timestamp}_${uniqueId}.${fileExtension}`;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB.");
        return;
      }
      const uniqueFileName = generateUniqueFileName(file.name);
      setPaymentProofFileName(uniqueFileName);
      const renamedFile = new File([file], uniqueFileName, { type: file.type });
      setPaymentProof(renamedFile);
      toast.success("Payment slip uploaded successfully.");
    }
  };

  const placeOrder = useCallback(
    async (paymentProofPath = null) => {
      try {
        let orderItems = [];

        for (const items in cartItems) {
          for (const item in cartItems[items]) {
            if (cartItems[items][item] > 0) {
              const itemInfo = structuredClone(
                products.find((product) => product._id === items)
              );
              if (itemInfo) {
                itemInfo.size = item;
                itemInfo.quantity = cartItems[items][item];
                orderItems.push(itemInfo);
              }
            }
          }
        }

        let orderData = {
          address: formData,
          items: orderItems,
          amount: getCartAmount() + delivery_fee,
          paymentMethod: method,
        };

        if (paymentProofPath) {
          orderData.paymentProof = paymentProofPath;
        }

        const response = await axios.post(
          backendUrl + "/api/order/place",
          orderData,
          { headers: { token } }
        );
        if (response.data.success) {
          setCartItems({});
          navigate("/orders");
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message);
      }
    },
    [
      cartItems,
      products,
      formData,
      getCartAmount,
      delivery_fee,
      method,
      paymentProofFileName,
      backendUrl,
      token,
      setCartItems,
      navigate,
    ]
  );

  const confirmQRPayment = useCallback(async () => {
    if (!paymentProof) {
      toast.error("Please upload your payment proof.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("paymentProof", paymentProof, paymentProofFileName);
      formData.append("amount", getCartAmount() + delivery_fee);

      const verifyResponse = await axios.post(
        backendUrl + "/api/order/verify-qr",
        formData,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          },
        }
      );

      setIsUploading(false);
      setUploadProgress(0);

      if (verifyResponse.data.success) {
        toast.success("Payment confirmed successfully!");
        setShowQRPopup(false);
        const paymentProofPath = verifyResponse.data.paymentProofPath;
        placeOrder(paymentProofPath);
      } else {
        toast.error(
          verifyResponse.data.message ||
            "Payment confirmation failed. Please try again."
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while confirming payment.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [
    paymentProof,
    paymentProofFileName,
    getCartAmount,
    delivery_fee,
    backendUrl,
    token,
    placeOrder,
  ]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (method === "QR Code") {
      if (!paymentProof) {
        toast.error("Please complete the QR Code payment first.");
        return;
      }
      confirmQRPayment();
    } else {
      placeOrder();
    }
  };

  return (
    <>
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
      >
        {/* ------------- Left Side ---------------- */}
        <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
          <div className="text-xl sm:text-2xl my-3">
            <Title text1={"DELIVERY"} text2={"INFORMATION"} />
          </div>
          <div className="flex gap-3">
            <input
              required
              onChange={onChangeHandler}
              name="firstName"
              value={formData.firstName}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="text"
              placeholder="First name"
            />
            <input
              required
              onChange={onChangeHandler}
              name="lastName"
              value={formData.lastName}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="text"
              placeholder="Last name"
            />
          </div>
          <input
            required
            onChange={onChangeHandler}
            name="email"
            value={formData.email}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="email"
            placeholder="Email address"
          />
          <input
            required
            onChange={onChangeHandler}
            name="street"
            value={formData.street}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Street"
          />
          <div className="flex gap-3">
            <input
              required
              onChange={onChangeHandler}
              name="city"
              value={formData.city}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="text"
              placeholder="City"
            />
            <input
              onChange={onChangeHandler}
              name="state"
              value={formData.state}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="text"
              placeholder="State"
            />
          </div>
          <div className="flex gap-3">
            <input
              required
              onChange={onChangeHandler}
              name="zipcode"
              value={formData.zipcode}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="number"
              placeholder="Zipcode"
            />
            <input
              required
              onChange={onChangeHandler}
              name="country"
              value={formData.country}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="text"
              placeholder="Country"
            />
          </div>
          <input
            required
            onChange={onChangeHandler}
            name="phone"
            value={formData.phone}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="number"
            placeholder="Phone"
          />
        </div>

        {/* ------------- Right Side ------------------ */}
        <div className="mt-8">
          <div className="mt-8 min-w-80">
            <CartTotal />
          </div>

          <div className="mt-12">
            <Title text1={"PAYMENT"} text2={"METHOD"} />
            {/* --------------- Payment Method Selection ------------- */}
            <div className="flex gap-3 flex-col lg:flex-row">
              <div
                onClick={() => {
                  setShowQRPopup(true);
                  setMethod("QR Code");
                }}
                className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
              >
                <p
                  className={`min-w-3.5 h-3.5 border rounded-full ${
                    method === "Scan QR Code" ? "bg-green-400" : ""
                  }`}
                ></p>
                <p className="text-gray-500 text-sm font-medium mx-4">
                  QR CODE
                </p>
                <img className="h-5 mx-4" src={assets.logo_qrcode} alt="" />
              </div>
              <div
                onClick={() => {
                  setMethod("CASH ON DELIVERY");
                  setPaymentProofPath(null);
                }}
                className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
              >
                <p
                  className={`min-w-3.5 h-3.5 border rounded-full ${
                    method === "CASH ON DELIVERY" ? "bg-green-400" : ""
                  }`}
                ></p>
                <p className="text-gray-500 text-sm font-medium mx-4">
                  CASH ON DELIVERY
                </p>
              </div>
            </div>

            <div className="w-full text-end mt-8">
              <button
                type="submit"
                className="bg-black text-white px-16 py-3 text-sm"
              >
                PLACE ORDER
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ------------- QR Code Popup ------------- */}
      {showQRPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-center">
              QR Code Payment
            </h2>
            <div className="flex flex-col items-center">
              <img
                src={qrcodePaymentImage}
                alt="Payment QR Code"
                className="w-64 h-64 object-contain mb-4"
              />
              <p className="mb-4 text-lg font-semibold">
                Total: ฿ {getCartAmount() + delivery_fee}
              </p>
            </div>
            <div className="mb-4">
              <p className="mb-2 text-sm text-gray-600">Upload Slip:</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                ref={fileInputRef}
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Choose File
              </button>
              {paymentProof && (
                <p className="mt-2 text-sm text-green-600">
                  File uploaded: {paymentProofFileName}
                </p>
              )}
            </div>
            {uploadProgress > 0 && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Uploading: {uploadProgress}%
                </p>
              </div>
            )}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setShowQRPopup(false);
                  setMethod("cod");
                  setUploadProgress(0);
                }}
                className="px-6 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmQRPayment}
                disabled={isUploading}
                className={`px-6 py-2 bg-black text-white rounded-md transition-colors ${
                  isUploading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-800"
                }`}
              >
                {isUploading ? "Uploading..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlaceOrder;
