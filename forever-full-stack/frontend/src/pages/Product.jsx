import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import RelatedProducts from "../components/RelatedProducts";

const Product = () => {
  const { productId } = useParams();
  const { products, addToCart, getProductsData } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [availableSizes, setAvailableSizes] = useState([]);
  const [stockCount, setStockCount] = useState(0);

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item);
        setImage(item.image[0]);
        // setColor(item.colors[0]);

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

  useEffect(() => {
    fetchProductData();
  }, [productId, getProductsData]);

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/*----------- Product Data-------------- */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/*---------- Product Images------------- */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                alt={`รูปสินค้า ${index + 1}`}
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img
              className="w-full h-auto"
              src={image}
              alt={`รูปสินค้า ${productData.name}`}
            />
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <p className="mt-5 text-3xl font-medium">
            ฿{productData.price.toLocaleString()}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>
          <div className="flex flex-col gap-4 my-8">
            <div>
              <p className="mb-2">เลือกไซส์</p>
              <div className="flex gap-2">
                {availableSizes.map((item, index) => (
                  <button
                    onClick={() => handleSizeSelect(item)}
                    className={`border py-2 px-4 bg-gray-100 hover:border-orange-500 transition-colors
                      ${
                        item === size ? "border-orange-500" : "border-gray-300"
                      }`}
                    key={index}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {size && color && (
                <p className="mt-2 text-sm text-gray-600">
                  เหลือ {stockCount} ชิ้น
                </p>
              )}
            </div>
            <div>
              <p className="mb-2">เลือกสี</p>
              <div className="flex gap-3">
                {productData.colors.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => selectColor(item)}
                    className={`w-8 h-8 rounded-full cursor-pointer ${getColorClass(
                      item
                    )} 
                      ${
                        item === color
                          ? "ring-2 ring-orange-500 ring-offset-2"
                          : ""
                      }`}
                    title={getColorName(item)}
                  />
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!size || !color || stockCount === 0}
            className={`px-8 py-3 text-sm transition-colors ${
              !size || !color || stockCount === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black text-white active:bg-gray-700 hover:bg-gray-800"
            }`}
          >
            เพิ่มลงตะกร้า
          </button>
        </div>
      </div>

      {/* ---------- Description & Review Section ------------- */}
      <div className="mt-20">
        <div className="flex">
          <b className="border px-5 py-3 text-sm">รายละเอียด</b>
        </div>
        <div className="flex flex-col gap-4 px-6 py-6 text-sm text-gray-500">
          <p>สินค้าของแท้ 100%</p>
          <p>รองรับการเก็บเงินปลายทาง</p>
          <p>เปลี่ยนคืนสินค้าได้ภายใน 7 วัน</p>
        </div>
      </div>

      {/* --------- display related products ---------- */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
