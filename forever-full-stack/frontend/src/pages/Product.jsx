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
                <p className="font-medium mb-3">เลือกไซส์</p>
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

      {/* --------- Related Products ---------- */}
      <div className="mt-16">
        <RelatedProducts
          category={productData.category}
          subCategory={productData.subCategory}
        />
      </div>
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
