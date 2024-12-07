import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import RelatedProducts from "../components/RelatedProducts";

const Product = () => {
  const { productId } = useParams();
  const { products, addToCart, getProductsData, backendUrl } =
    useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [availableSizes, setAvailableSizes] = useState([]);
  const [stockCount, setStockCount] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item);
        setImage(item.image[0]);
        const uniqueSizes = [
          ...new Set(item.stockItems.map((stock) => stock.size)),
        ];
        setAvailableSizes(uniqueSizes);
        return null;
      }
    });
  };

  const selectColor = (color) => {
    setColor(color);
  };

  const getColorClass = (colorName) => {
    const colorMap = {
      Black: "bg-black",
      White: "bg-white border border-gray-300",
      Gray: "bg-gray-500",
      Navy: "bg-blue-900",
      Red: "bg-red-500",
      Blue: "bg-blue-500",
      Green: "bg-green-500",
      Yellow: "bg-yellow-400",
      Purple: "bg-purple-500",
      Pink: "bg-pink-500",
      Orange: "bg-orange-500",
      Brown: "bg-amber-800",
      Beige: "bg-[#F5F5DC]",
    };
    return colorMap[colorName] || "bg-gray-200";
  };

  const handleSizeSelect = (selectedSize) => {
    setSize(selectedSize);
  };

  useEffect(() => {
    if (color && size) {
      const stockItem = productData.stockItems.find(
        (item) => item.size === size && item.color === color
      );
      setStockCount(stockItem?.stock || 0);
    }
  }, [color, size]);

  const getColorName = (colorName) => {
    const colorNames = {
      Black: "ดำ",
      White: "ขาว",
      Gray: "เทา",
      Navy: "กรมท่า",
      Red: "แดง",
      Blue: "น้ำเงิน",
      Green: "เขียว",
      Yellow: "เหลือง",
      Purple: "ม่วง",
      Pink: "ชมพู",
      Orange: "ส้ม",
      Brown: "น้ำตาล",
      Beige: "เบจ",
    };
    return colorNames[colorName] || colorName;
  };

  const handleAddToCart = () => {
    addToCart({
      productId: productData._id,
      size,
      color,
      quantity: 1,
    });
  };

  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getProductReviews = async () => {
    if (!productId) return;
    try {
      const response = await fetch(
        `${backendUrl}/api/product/${productId}/reviews`
      );
      const data = await response.json();
      setReviews(data.reviews);
      setAverageRating(calculateAverageRating(data.reviews));
    } catch (error) {
      console.log(error);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} className="text-yellow-500">
            ★
          </span>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-500">
            ½
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300">
            ☆
          </span>
        );
      }
    }

    return stars;
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  useEffect(() => {
    getProductReviews();
  }, [productId]);

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/*----------- Product Data-------------- */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row max-w-7xl mx-auto px-4">
        {/*---------- Product Images------------- */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-auto max-h-[500px] justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity rounded-lg"
                alt={`รูปสินค้า ${index + 1}`}
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img
              className="w-full h-auto rounded-lg shadow-md"
              src={image}
              alt={`รูปสินค้า ${productData.name}`}
            />
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className="flex-1 space-y-6">
          <div className="border-b pb-4">
            <h1 className="font-medium text-2xl mb-2">{productData.name}</h1>
            <div className="space-y-2">
              <p className="text-3xl font-medium text-gray-900">
                ฿{productData.price.toLocaleString()}
              </p>
              <p className="text-gray-500">
                ค่าจัดส่ง: ฿{productData.shippingCost.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              {productData.description}
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <p className="font-medium">เลือกไซส์</p>
                  {productData.sizeGuide && (
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                    >
                      คำแนะนำไซส์
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 ml-1"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((item, index) => (
                    <button
                      onClick={() => handleSizeSelect(item)}
                      className={`border py-2 px-4 rounded-md transition-all
                        ${
                          item === size
                            ? "border-black bg-black text-white"
                            : "border-gray-300 hover:border-gray-500 hover:bg-gray-50"
                        }`}
                      key={index}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-medium mb-3">เลือกสี</p>
                <div className="flex flex-wrap gap-3">
                  {productData.colors.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => selectColor(item)}
                      className={`w-10 h-10 rounded-full cursor-pointer ${getColorClass(
                        item
                      )} 
                        ${
                          item === color
                            ? "ring-2 ring-black ring-offset-2"
                            : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
                        }`}
                      title={getColorName(item)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {size && color && (
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md inline-block">
                เหลือ {stockCount} ชิ้น
              </p>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleAddToCart}
                disabled={!size || !color || stockCount === 0}
                className={`px-12 py-3 rounded-lg font-medium transition-all
                  ${
                    !size || !color || stockCount === 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-800 active:bg-gray-900"
                  }
                `}
              >
                เพิ่มลงตะกร้า
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Description Section ------------- */}
      <div className="mt-16 max-w-7xl mx-auto px-4">
        <div className="border-b">
          <h2 className="text-lg font-medium pb-3">รายละเอียด</h2>
        </div>
        <div className="py-6 space-y-3 text-gray-600">
          <p>• สินค้าของแท้ 100%</p>
          <p>• รองรับการเก็บเงินปลายทาง</p>
          <p>• เปลี่ยนคืนสินค้าได้ภายใน 7 วัน</p>
        </div>
      </div>

      <div>
        {productId ? (
          reviews.length > 0 ? (
            <>
              <div className="max-w-7xl mx-auto px-4">
                <div className="border-b">
                  <h2 className="text-lg font-medium pb-3">รีวิวสินค้า</h2>
                  <p className="text-gray-600 mb-2">คะแนนคุณภาพสินค้า</p>
                  <div className="pb-4 flex items-center gap-2">
                    <div className="flex">{renderStars(averageRating)}</div>
                    <span className="text-lg font-medium">{averageRating}</span>
                    <span className="text-gray-500">
                      ({reviews.length} รีวิว)
                    </span>
                  </div>
                </div>
              </div>
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="flex gap-4 max-w-7xl mx-auto px-4 py-4 border-b"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200">
                    <img
                      src={review.user.profileImage}
                      alt={review.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{review.user.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex text-sm">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-gray-500">
                        {review.date.split("T")[0]}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{review.comment}</p>

                    {review.images.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`รูปรีวิว ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-lg font-medium pb-3">ยังไม่มีรีวิวสินค้า</h2>
            </div>
          )
        ) : null}
      </div>

      {/* --------- Related Products ---------- */}
      <div className="mt-16">
        <RelatedProducts
          category={productData.category}
          subCategory={productData.subCategory}
        />
      </div>

      {/* Add Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-xl w-fit mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">คำแนะนำไซส์</h3>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <img
              src={productData.sizeGuide}
              alt="Size Guide"
              className="w-auto h-auto max-h-[70vh]"
            />
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
