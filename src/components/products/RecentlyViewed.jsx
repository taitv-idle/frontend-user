import React from 'react';
import { Link } from 'react-router-dom';
import Rating from '../Rating';

const RecentlyViewed = () => {
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(price);
    };

    const calculateDiscountedPrice = (price, discount) => {
        if (!discount || discount === 0) return price;
        return price - Math.floor((price * discount) / 100);
    };

    if (viewed.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500">
                Chưa có sản phẩm nào được xem gần đây
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {viewed.map((product) => {
                const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
                
                return (
                    <Link
                        key={product._id}
                        to={`/product/details/${product.slug}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="w-20 h-20 flex-shrink-0">
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-contain rounded-md bg-white"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/default-product.png';
                                }}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                                {product.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-red-500">
                                    {formatPrice(discountedPrice)}
                                </span>
                                {product.discount > 0 && (
                                    <span className="text-xs text-gray-500 line-through">
                                        {formatPrice(product.price)}
                                    </span>
                                )}
                            </div>
                            <Rating ratings={product.rating} size="small" />
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};

export default RecentlyViewed; 