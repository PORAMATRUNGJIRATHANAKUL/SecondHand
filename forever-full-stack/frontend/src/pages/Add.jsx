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
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);

  const [stockItems, setStockItems] = useState([]);

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
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("colors", JSON.stringify(colors));
      formData.append("stockItems", JSON.stringify(stockItems));

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
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
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">เพิ่มสินค้าใหม่</h1>

      <form onSubmit={onSubmitHandler} className="space-y-8">
        {/* Image Upload Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">รูปภาพสินค้า</h2>
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
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
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
                  <option value="Clothing">Clothing</option>
                  <option value="Pants">Pants</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Hats">Hats</option>
                  <option value="Glasses">Glasses</option>
                  <option value="Accessories">Accessories</option>
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

        {/* Bestseller Option */}
        <div className="bg-white p-6 rounded-lg shadow">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={bestseller}
              onChange={() => setBestseller((prev) => !prev)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">เพิ่มในสินค้าขายดี</span>
          </label>
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
