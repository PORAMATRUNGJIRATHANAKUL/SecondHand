import React, { useState, useEffect, useContext } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const Add = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Clothing");
  const [productCondition, setProductCondition] = useState("new");
  const [conditionPercentage, setConditionPercentage] = useState("");
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [stockItems, setStockItems] = useState([]);

  const [shippingType, setShippingType] = useState("free");
  const [shippingCost, setShippingCost] = useState("");

  const [sizeGuide, setSizeGuide] = useState(false);

  const sizeData = {
    clothing: {
      tops: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
      bottoms: {
        waist: [
          "23",
          "24",
          "25",
          "26",
          "27",
          "28",
          "29",
          "30",
          "31",
          "32",
          "33",
          "34",
          "35",
          "36",
          "38",
          "40",
          "42",
        ],
        length: ["Short", "Regular", "Long"],
      },
    },
    shoes: {
      men: [
        "39",
        "39.5",
        "40",
        "40.5",
        "41",
        "41.5",
        "42",
        "42.5",
        "43",
        "43.5",
        "44",
        "44.5",
        "45",
        "45.5",
        "46",
      ],
      women: [
        "35",
        "35.5",
        "36",
        "36.5",
        "37",
        "37.5",
        "38",
        "38.5",
        "39",
        "39.5",
        "40",
        "40.5",
        "41",
      ],
    },
    noSize: ["Free Size", "One Size"],
  };

  const colorData = [
    { name: "Black", class: "bg-black" },
    { name: "White", class: "bg-white border border-gray-300" },
    { name: "Gray", class: "bg-gray-500" },
    { name: "Navy", class: "bg-blue-900" },
    { name: "Red", class: "bg-red-500" },
    { name: "Blue", class: "bg-blue-500" },
    { name: "Green", class: "bg-green-500" },
    { name: "Yellow", class: "bg-yellow-400" },
    { name: "Purple", class: "bg-purple-500" },
    { name: "Pink", class: "bg-pink-500" },
    { name: "Orange", class: "bg-orange-500" },
    { name: "Brown", class: "bg-amber-800" },
    { name: "Beige", class: "bg-[#F5F5DC]" },
  ];

  const updateAvailableSizes = (productType) => {
    switch (productType) {
      case "Clothing":
        setAvailableSizes(sizeData.clothing.tops);
        break;
      case "Pants":
        setAvailableSizes(sizeData.clothing.bottoms.waist);
        break;
      case "Shoes":
        if (category === "Men") {
          setAvailableSizes(sizeData.shoes.men);
        } else if (category === "Women") {
          setAvailableSizes(sizeData.shoes.women);
        } else {
          setAvailableSizes(sizeData.shoes.women);
        }
        break;
      case "Hats":
      case "Glasses":
      case "Accessories":
        setAvailableSizes(sizeData.noSize);
        break;
      default:
        setAvailableSizes([]);
    }
    setSizes([]);
  };

  useEffect(() => {
    updateAvailableSizes(subCategory);
  }, [subCategory, category]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("popular", productCondition.includes("popular"));
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("colors", JSON.stringify(colors));
      formData.append("stockItems", JSON.stringify(stockItems));
      formData.append("productCondition", productCondition);
      if (productCondition === "used" || productCondition === "used_popular") {
        if (!conditionPercentage || conditionPercentage === "") {
          toast.error("กรุณากรอกสภาพการใช้งานสำหรับสินค้ามือสอง");
          return;
        }
        formData.append("conditionPercentage", Number(conditionPercentage));
      } else {
        formData.append("conditionPercentage", 100);
      }

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      formData.append("shippingType", shippingType);
      formData.append(
        "shippingCost",
        shippingType === "paid" ? shippingCost : "0"
      );

      sizeGuide && formData.append("sizeGuide", sizeGuide);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("เพิ่มสินค้าสำเร็จ");
        // Reset all fields
        setName("");
        setDescription("");
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setPrice("");
        setSizes([]);
        setColors([]);
        setStockItems([]);
        setShippingType("free");
        setShippingCost("");
        setSizeGuide(false);
        setProductCondition("new");
        setConditionPercentage("");
      } else {
        toast.error("ไม่สามารถเพิ่มสินค้าได้");
      }
    } catch (error) {
      console.log(error);
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">เพิ่มสินค้าใหม่</h1>

      <form onSubmit={onSubmitHandler} className="space-y-8">
        {/* Image Upload Section */}
        <div className="bg-white p-6 rounded-lg shadow">
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

        {/* Product Details Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">รายละเอียดสินค้า</h2>
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อสินค้า
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="กรอกชื่อสินค้า"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รายละเอียดสินค้า
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="กรอกรายละเอียดสินค้า"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมวดหมู่
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Men">ผู้ชาย</option>
                  <option value="Women">ผู้หญิง</option>
                  <option value="Kids">เด็ก</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทสินค้า
                </label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Clothing">เสื้อผ้า</option>
                  <option value="Pants">กางเกง</option>
                  <option value="Shoes">รองเท้า</option>
                  <option value="Hats">หมวก</option>
                  <option value="Glasses">แว่นตา</option>
                  <option value="Accessories">เครื่องประดับ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ราคา
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สภาพสินค้า
                </label>
                <select
                  value={productCondition}
                  onChange={(e) => setProductCondition(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="new">สินค้าใหม่</option>
                  <option value="new_popular">สินค้าใหม่ (ยอดนิยม)</option>
                  <option value="used">สินค้ามือสอง</option>
                  <option value="used_popular">สินค้ามือสอง (ยอดนิยม)</option>
                </select>
              </div>

              {(productCondition === "used" ||
                productCondition === "used_popular") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    สภาพการใช้งาน (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={conditionPercentage}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setConditionPercentage("");
                        } else {
                          const numValue = parseInt(value);
                          if (
                            !isNaN(numValue) &&
                            numValue >= 0 &&
                            numValue <= 100
                          ) {
                            setConditionPercentage(numValue.toString());
                          }
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0-100"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sizes and Colors Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">ไซส์และสี</h2>

          <div className="space-y-6">
            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ไซส์ที่มีจำหน่าย
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      setSizes((prev) =>
                        prev.includes(size)
                          ? prev.filter((item) => item !== size)
                          : [...prev, size]
                      )
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                      ${
                        sizes.includes(size)
                          ? "bg-blue-100 text-blue-800 ring-2 ring-blue-500"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สีที่มีจำหน่าย
              </label>
              <div className="flex flex-wrap gap-3">
                {colorData.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() =>
                      setColors((prev) =>
                        prev.includes(color.name)
                          ? prev.filter((item) => item !== color.name)
                          : [...prev, color.name]
                      )
                    }
                    className={`w-8 h-8 rounded-full ${color.class} ${
                      colors.includes(color.name)
                        ? "ring-2 ring-blue-500 ring-offset-2"
                        : ""
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stock Management Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">จัดการสต็อก</h2>
          {sizes.length > 0 && colors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">ไซส์</th>
                    <th className="text-left py-2">สี</th>
                    <th className="text-left py-2">จำนวน</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) =>
                    colors.map((color) => (
                      <tr key={`${size}-${color}`} className="border-b">
                        <td className="py-2">{size}</td>
                        <td className="py-2">{color}</td>
                        <td className="py-2">
                          <input
                            type="number"
                            min="0"
                            className="w-24 px-3 py-1 border border-gray-300 rounded-md"
                            placeholder="0"
                            value={
                              stockItems.find(
                                (item) =>
                                  item.size === size && item.color === color
                              )?.stock || ""
                            }
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setStockItems((prev) => {
                                const existing = prev.find(
                                  (item) =>
                                    item.size === size && item.color === color
                                );
                                if (existing) {
                                  return prev.map((item) =>
                                    item.size === size && item.color === color
                                      ? { ...item, stock: value }
                                      : item
                                  );
                                }
                                return [...prev, { size, color, stock: value }];
                              });
                            }}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">กรุณาเลือกไซส์และสีก่อนจัดการสต็อก</p>
          )}
        </div>

        {/* Size Guide Image Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">คำแนะนำไซส์</h2>
          <div className="space-y-4">
            <label
              htmlFor="sizeGuide"
              className="relative cursor-pointer block"
            >
              <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                {!sizeGuide ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <img
                      src={assets.upload_area}
                      alt="Upload"
                      className="w-16 h-16 mb-2"
                    />
                    <span>คลิกเพื่ออัปโหลดรูปภาพคำแนะนำไซส์</span>
                  </div>
                ) : (
                  <img
                    src={URL.createObjectURL(sizeGuide)}
                    alt="Size Guide"
                    className="w-full h-full object-contain rounded-lg"
                  />
                )}
              </div>
              <input
                type="file"
                id="sizeGuide"
                onChange={(e) => setSizeGuide(e.target.files[0])}
                accept="image/*"
                hidden
              />
            </label>
            {sizeGuide && (
              <button
                type="button"
                onClick={() => setSizeGuide(false)}
                className="inline-flex items-center text-red-500 hover:text-red-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 mr-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
                <span>ลบรูปภาพ</span>
              </button>
            )}
          </div>
        </div>

        {/* Add Shipping Section before the Submit Button */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">ค่าจัดส่ง</h2>
          <div className="space-y-4">
            <select
              value={shippingType}
              onChange={(e) => setShippingType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="free">ไม่มีค่าจัดส่ง</option>
              <option value="paid">ขนส่งเอกชน</option>
            </select>

            {shippingType === "paid" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ราคาค่าจัดส่ง (฿)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ฿
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            เพิ่มสินค้า
          </button>
        </div>
      </form>
    </div>
  );
};

export default Add;
