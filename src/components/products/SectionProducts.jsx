import React from 'react';
import { Link } from 'react-router-dom';
import Rating from '../Rating';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const SectionProducts = ({ title, products }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="relative">
      {title && (
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 relative after:absolute after:bottom-0 after:left-0 after:w-24 after:h-1 after:bg-emerald-600">
          {title}
        </h2>
      )}
      
      <Swiper
        slidesPerView="auto"
        breakpoints={{
          1280: { slidesPerView: 4 },
          1024: { slidesPerView: 3 },
          640: { slidesPerView: 2 },
          320: { slidesPerView: 1 }
        }}
        spaceBetween={20}
        pagination={{
          clickable: true,
          el: '.custom_bullet'
        }}
        modules={[Pagination]}
        className="mySwiper"
      >
        {products?.map((product, i) => (
          <SwiperSlide key={i}>
            <Link to={`/product/${product.slug}`} className="block group">
              <div className="relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                <div className="aspect-[4/3] relative">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {product.discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      -{product.discount}%
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-emerald-600">
                        {formatPrice(product.discount ? 
                          product.price - Math.floor(product.price * product.discount / 100) : 
                          product.price
                        )}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    <Rating ratings={product.rating} size="small" />
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="w-full flex justify-center items-center py-8">
        <div className="custom_bullet justify-center gap-3 !w-auto"></div>
      </div>
    </div>
  );
};

export default SectionProducts; 