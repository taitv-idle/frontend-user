import React from 'react';
import { FaEye, FaHeart, FaRegHeart } from "react-icons/fa";
import { RiShoppingCartLine } from "react-icons/ri";
import Rating from '../Rating';
import { Link } from 'react-router-dom';

const ShopProducts = ({ styles, products }) => {
    const [wishlist, setWishlist] = React.useState([]);

    const toggleWishlist = (productId) => {
        setWishlist(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className={`w-full grid ${
            styles === 'grid'
                ? 'grid-cols-2 md:grid-cols-3'
                : 'grid-cols-1'
        } gap-4`}>
            {products.map((product) => (
                <div
                    key={product._id}
                    className={`group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 ${
                        styles === 'list' ? 'flex flex-col md:flex-row md:items-center' : ''
                    }`}
                >
                    {/* Product Image */}
                    <div className={`relative overflow-hidden ${
                        styles === 'grid'
                            ? 'aspect-[4/3]'
                            : 'md:w-1/4 aspect-[4/3] md:aspect-auto'
                    }`}>
                        <img
                            className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                            src={product.images[0]}
                            alt={product.name}
                            loading="lazy"
                            onError={(e) => {
                                e.target.src = '/images/default-product.png';
                            }}
                        />

                        {/* Product Badges */}
                        {product.discount > 0 && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                -{product.discount}%
                            </div>
                        )}

                        {/* Product Actions */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                                onClick={() => toggleWishlist(product._id)}
                                className="p-1 bg-white rounded-full shadow-sm hover:bg-red-50 transition-colors"
                                aria-label={wishlist.includes(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                {wishlist.includes(product._id) ? (
                                    <FaHeart className="text-red-500" size={12} />
                                ) : (
                                    <FaRegHeart className="text-gray-600 hover:text-red-500" size={12} />
                                )}
                            </button>

                            <Link
                                to={`/product/details/${product.slug}`}
                                className="p-1 bg-white rounded-full shadow-sm hover:bg-blue-50 transition-colors"
                                aria-label="Xem chi tiết"
                                title="Xem chi tiết"
                            >
                                <FaEye className="text-gray-600 hover:text-blue-600" size={12} />
                            </Link>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className={`p-3 flex-1 ${
                        styles === 'list' ? 'md:w-3/4 md:pl-4' : ''
                    }`}>
                        <Link to={`/product/details/${product.slug}`}>
                            <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 hover:text-emerald-600 transition-colors text-sm">
                                {product.name}
                            </h3>
                        </Link>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="text-base font-semibold text-emerald-600">
                                    {formatPrice(product.price)}
                                </span>
                                {product.discount > 0 && (
                                    <span className="text-xs text-gray-500 line-through">
                                        {formatPrice(product.price / (1 - product.discount/100))}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-1">
                                <Rating
                                    ratings={product.rating}
                                    size="small"
                                    className="space-x-0.5"
                                />
                                <span className="text-xs text-gray-600">
                                    ({product.sold || 0})
                                </span>
                            </div>
                        </div>

                        {styles === 'grid' && (
                            <button
                                className="w-full flex items-center justify-center gap-1 py-1.5 mt-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm"
                                aria-label="Add to cart"
                            >
                                <RiShoppingCartLine size={14} />
                                Thêm
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ShopProducts;