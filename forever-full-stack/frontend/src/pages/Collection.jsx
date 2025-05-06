import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import ProductItem from "../components/ProductItem";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [productCondition, setProductCondition] = useState("");
  const [sortType, setSortType] = useState("relevant");

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      productsCopy = productsCopy.filter((item) => item.category === category);
    }

    if (subCategory) {
      productsCopy = productsCopy.filter(
        (item) => item.subCategory === subCategory
      );
    }

    if (productCondition) {
      switch (productCondition) {
        case "new":
          productsCopy = productsCopy.filter(
            (item) => item.productCondition === "new"
          );
          break;
        case "new_popular":
          productsCopy = productsCopy.filter(
            (item) => item.productCondition === "new_popular"
          );
          break;
        case "used":
          productsCopy = productsCopy.filter(
            (item) => item.productCondition === "used"
          );
          break;
        case "used_popular":
          productsCopy = productsCopy.filter(
            (item) => item.productCondition === "used_popular"
          );
          break;
      }
    }

    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case "low-high":
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;

      case "high-low":
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;

      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, productCondition, search, showSearch, products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
      {/* ส่วนตัวกรอง */}
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex items-center cursor-pointer gap-2"
        >
          ตัวกรอง
          <img
            className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon}
            alt=""
          />
        </p>
        {/* ตัวกรองหมวดหมู่ */}
        <div
          className={`border border-gray-300 p-4 rounded-md my-5 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">หมวดหมู่</p>
          <div className="text-sm font-light text-gray-700">
            <select
              className="w-full p-2 border rounded-md"
              onChange={(e) => setCategory(e.target.value)}
              value={category}
            >
              <option value="">เลือกหมวดหมู่</option>
              <option value="Men">ผู้ชาย</option>
              <option value="Women">ผู้หญิง</option>
              <option value="Kids">เด็ก</option>
            </select>
          </div>
        </div>
        {/* ตัวกรองประเภทย่อย */}
        <div
          className={`border border-gray-300 p-4 rounded-md my-5 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">ประเภท</p>
          <div className="text-sm font-light text-gray-700">
            <select
              className="w-full p-2 border rounded-md"
              onChange={(e) => setSubCategory(e.target.value)}
              value={subCategory}
            >
              <option value="">เลือกประเภท</option>
              <option value="Clothing">เสื้อผ้า</option>
              <option value="Pants">กางเกง</option>
              <option value="Shoes">รองเท้า</option>
              <option value="Hats">หมวก</option>
              <option value="Glasses">แว่นตา</option>
            </select>
          </div>
        </div>
        {/* ตัวกรองสภาพสินค้า */}
        <div
          className={`border border-gray-300 p-4 rounded-md my-5 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">สภาพสินค้า</p>
          <div className="text-sm font-light text-gray-700">
            <select
              className="w-full p-2 border rounded-md"
              onChange={(e) => setProductCondition(e.target.value)}
              value={productCondition}
            >
              <option value="">เลือกสภาพสินค้า</option>
              <option value="new">สินค้าใหม่</option>
              <option value="new_popular">สินค้าใหม่ (ยอดนิยม)</option>
              <option value="used">สินค้ามือสอง</option>
              <option value="used_popular">สินค้ามือสอง (ยอดนิยม)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ส่วนแสดงสินค้า */}
      <div className="flex-1">
        <div className="flex justify-between text-base sm:text-2xl mb-4">
          <div className="inline-flex gap-2 items-center mb-3">
            <p className="text-gray-500">สินค้าทั้งหมด</p>
          </div>
          {/* ตัวเรียงลำดับ */}
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="border-2 border-gray-300 text-sm px-2"
          >
            <option value="relevant">เรียงตาม: ที่เกี่ยวข้อง</option>
            <option value="low-high">เรียงตาม: ราคาต่ำ-สูง</option>
            <option value="high-low">เรียงตาม: ราคาสูง-ต่ำ</option>
          </select>
        </div>

        {/* แสดงรายการสินค้า */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
          {filterProducts.map((item, index) => (
            <div key={index} className="w-full">
              <div className="aspect-[3/4]">
                <ProductItem
                  name={item.name}
                  id={item._id}
                  price={item.price}
                  image={item.image}
                  owner={{
                    ...item.owner,
                    profileImage: item.owner?.profileImage,
                  }}
                  productCondition={item.productCondition}
                  conditionPercentage={item.conditionPercentage}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
