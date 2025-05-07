import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Rating from '../Rating';
import { AiOutlineEye } from 'react-icons/ai';
import { FaHeart } from 'react-icons/fa';

const RecentlyViewed = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    setProducts(viewed.slice(0, 5));
  }, []);

  if (!products.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
      <h3 className="text-lg font-semibold text-red-600 mb-4">Sản phẩm vừa xem</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {products.map((product) => (
          <Link to={`/product/${product.slug}`} key={product._id} className="block group">
            <div className="relative overflow-hidden rounded-lg shadow hover:shadow-md transition-all duration-300">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
              />
              {product.discount > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  -{product.discount}%
                </div>
              )}
              <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                <span className="bg-white bg-opacity-80 rounded-full p-2 shadow-md flex items-center justify-center">
                  <AiOutlineEye className="text-red-500" size={26} />
                </span>
                <span className="bg-white bg-opacity-80 rounded-full p-2 shadow-md flex items-center justify-center">
                  <FaHeart className="text-red-500" size={22} />
                </span>
              </div>
            </div>
            <div className="mt-2">
              <div className="font-medium text-gray-800 text-sm line-clamp-2">{product.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-red-600 font-semibold text-sm">
                  {product.price.toLocaleString()}đ
                </span>
                <Rating ratings={product.rating} size="small" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed; 