import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {

  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    setLatestProducts(products.slice(0, 10));
  }, [products])

  return (
    <div className='my-10'>
      <div className='text-center text-2xl py-8'>
        <div className="inline-flex gap-2 items-center mb-3">
          <p className="text-gray-500">สินค้ามาใหม่
            <span className="text-gray-700 font-medium"></span></p>
        </div>
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          สินค้าค้ายอดนิยมมือสอง สภาพดี มีให้เลือกหลายประเภทหลากหลายแบบ
        </p>
      </div>

      {/* Rendering Products */}
      <div className='w-3/4 h-auto m-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {
          latestProducts.map((item, index) => (
            <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} />
          ))
        }
      </div>
    </div>
  )
}

export default LatestCollection
