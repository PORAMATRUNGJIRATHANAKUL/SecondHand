import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../components/ProductItem";

const Shop = () => {
  const { shopId } = useParams();
  const { products, backendUrl } = useContext(ShopContext);
  const [shopProducts, setShopProducts] = useState([]);
  const [shopInfo, setShopInfo] = useState(null);

  useEffect(() => {
    // Filter products by shop ID
    const filteredProducts = products.filter(
      (product) => product.owner?._id === shopId
    );
    setShopProducts(filteredProducts);

    // Get shop info from the first product
    if (filteredProducts.length > 0) {
      setShopInfo(filteredProducts[0].owner);
    }
  }, [shopId, products]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {shopInfo && (
        <div className="mb-8">
          <div className="flex items-center gap-4">
            {shopInfo.profileImage ? (
              <img
                src={shopInfo.profileImage}
                alt={shopInfo.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-300"></div>
            )}
            <div>
              <h1 className="text-2xl font-medium">{shopInfo.name}</h1>
              <p className="text-gray-500">{shopProducts.length} สินค้า</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {shopProducts.map((product) => (
          <ProductItem
            key={product._id}
            id={product._id}
            image={product.image}
            name={product.name}
            price={product.price}
            owner={product.owner}
            productCondition={product.productCondition}
            conditionPercentage={product.conditionPercentage}
          />
        ))}
      </div>

      {shopProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">ไม่พบสินค้าในร้านนี้</p>
        </div>
      )}
    </div>
  );
};

export default Shop;
