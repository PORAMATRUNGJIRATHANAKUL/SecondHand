import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
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
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // ส่วนแสดงผลสี
  const ColorSelector = () => (
    <div>
      <p className="mb-2">Product Colors</p>
      <div className="flex flex-wrap gap-3">
        {colorData.map((color) => (
          <div
            key={color.name}
            onClick={() =>
              setColors((prev) =>
                prev.includes(color.name)
                  ? prev.filter((item) => item !== color.name)
                  : [...prev, color.name]
              )
            }
            className={`w-8 h-8 rounded-full cursor-pointer ${color.class} ${
              colors.includes(color.name)
                ? "ring-2 ring-blue-500 ring-offset-2"
                : ""
            }`}
            title={color.name}
          />
        ))}
      </div>
      {colors.length > 0 && (
        <p className="text-sm text-gray-500 mt-2">
          Selected colors: {colors.join(", ")}
        </p>
      )}
    </div>
  );

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-3"
    >
      {/* Image Upload */}
      <div>
        <p className="mb-2">Upload Image</p>
        <div className="flex gap-2">
          <label htmlFor="image1">
            <img
              className="w-20"
              src={!image1 ? assets.upload_area : URL.createObjectURL(image1)}
              alt=""
            />
            <input
              onChange={(e) => setImage1(e.target.files[0])}
              type="file"
              id="image1"
              hidden
            />
          </label>
          <label htmlFor="image2">
            <img
              className="w-20"
              src={!image2 ? assets.upload_area : URL.createObjectURL(image2)}
              alt=""
            />
            <input
              onChange={(e) => setImage2(e.target.files[0])}
              type="file"
              id="image2"
              hidden
            />
          </label>
          <label htmlFor="image3">
            <img
              className="w-20"
              src={!image3 ? assets.upload_area : URL.createObjectURL(image3)}
              alt=""
            />
            <input
              onChange={(e) => setImage3(e.target.files[0])}
              type="file"
              id="image3"
              hidden
            />
          </label>
          <label htmlFor="image4">
            <img
              className="w-20"
              src={!image4 ? assets.upload_area : URL.createObjectURL(image4)}
              alt=""
            />
            <input
              onChange={(e) => setImage4(e.target.files[0])}
              type="file"
              id="image4"
              hidden
            />
          </label>
        </div>
      </div>

      {/* Product Details */}
      <div className="w-full">
        <p className="mb-2">Product name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Type here"
          required
        />
      </div>

      <div className="w-full">
        <p className="mb-2">Product description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Write content here"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Product category</p>
          <select
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2"
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Product Type</p>
          <select
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full px-3 py-2"
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
          <p className="mb-2">Product Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-3 py-2 sm:w-[120px]"
            type="Number"
            placeholder=""
            required
          />
        </div>
      </div>

      {/* Product Sizes */}
      <div className="w-full">
        <p className="mb-2">Product Sizes</p>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => (
            <div
              key={size}
              onClick={() =>
                setSizes((prev) =>
                  prev.includes(size)
                    ? prev.filter((item) => item !== size)
                    : [...prev, size]
                )
              }
            >
              <p
                className={`${
                  sizes.includes(size)
                    ? "bg-blue-200 ring-2 ring-blue-500"
                    : "bg-slate-200"
                } px-4 py-2 cursor-pointer rounded hover:bg-blue-100`}
              >
                {size}
              </p>
            </div>
          ))}
        </div>
        {sizes.length > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Selected sizes: {sizes.join(", ")}
          </p>
        )}
      </div>

      {/* Colors */}
      <ColorSelector />

      {/* Bestseller Option */}
      <div className="flex gap-2 mt-2">
        <input
          onChange={() => setBestseller((prev) => !prev)}
          checked={bestseller}
          type="checkbox"
          id="bestseller"
        />
        <label className="cursor-pointer" htmlFor="bestseller">
          Add to bestseller
        </label>
      </div>

      {/* Submit Button */}
      <button type="submit" className="w-28 py-3 mt-4 bg-black text-white">
        ADD
      </button>
    </form>
  );
};

export default Add;
