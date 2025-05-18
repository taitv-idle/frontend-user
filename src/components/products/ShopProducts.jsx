import React from 'react';
import { FaEye, FaHeart } from "react-icons/fa";
import { RiShoppingCartLine } from "react-icons/ri";
import Rating from '../Rating';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { add_to_card, add_to_wishlist, messageClear } from '../../store/reducers/cardReducer';
import toast from 'react-hot-toast';

const ShopProducts = ({ styles, products }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector(state => state.auth);
    const { errorMessage, successMessage } = useSelector(state => state.card);

    React.useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch]);

    const add_card = (id) => {
        if (userInfo) {
            dispatch(add_to_card({
                userId: userInfo.id,
                quantity: 1,
                productId: id
            }));
        } else {
            navigate('/login');
        }
    };

    const add_wishlist = (pro) => {
        if (userInfo) {
            dispatch(add_to_wishlist({
                userId: userInfo.id,
                productId: pro._id,
                name: pro.name,
                price: pro.price,
                image: pro.images[0],
                discount: pro.discount,
                rating: pro.rating,
                slug: pro.slug
            }));
        } else {
            navigate('/login');
        }
    };

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

    return (
        <div className={`w-full grid ${
            styles === 'grid'
                ? 'grid-cols-2 md:grid-cols-3'
                : 'grid-cols-1'
        } gap-4`}>
            {products.map((product) => {
                const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
                
                return (
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
                                <div className="absolute top-2 left-2 bg-red-400 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                    -{product.discount}%
                                </div>
                            )}

                            {/* Product Actions */}
                            <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                                <button
                                    onClick={() => add_wishlist(product)}
                                    className="p-2 bg-white rounded-full shadow-sm hover:bg-red-100 transition-colors"
                                    aria-label="Yêu thích"
                                >
                                    <FaHeart className="text-red-400" size={20} />
                                </button>
                                <Link
                                    to={`/product/details/${product.slug}`}
                                    className="p-2 bg-white rounded-full shadow-sm hover:bg-red-100 transition-colors"
                                    aria-label="Xem chi tiết"
                                    title="Xem chi tiết"
                                >
                                    <FaEye className="text-red-400" size={20} />
                                </Link>
                                <button
                                    onClick={() => add_card(product._id)}
                                    className="p-2 bg-white rounded-full shadow-sm hover:bg-red-100 transition-colors"
                                    aria-label="Thêm vào giỏ hàng"
                                    title="Thêm vào giỏ hàng"
                                >
                                    <RiShoppingCartLine className="text-red-400" size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className={`p-3 flex-1 ${
                            styles === 'list' ? 'md:w-3/4 md:pl-4' : ''
                        }`}>
                            <Link to={`/product/details/${product.slug}`}>
                                <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 hover:text-red-400 transition-colors text-sm">
                                    {product.name}
                                </h3>
                            </Link>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-semibold text-red-400">
                                        {formatPrice(discountedPrice)}
                                    </span>
                                    {product.discount > 0 && (
                                        <span className="text-xs text-gray-500 line-through">
                                            {formatPrice(product.price)}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center">
                                        <Rating
                                            ratings={product.rating}
                                            size="small"
                                            className="space-x-0.5"
                                        />
                                        <span className="text-xs text-gray-600 ml-1">
                                            ({product.rating || 0})
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-600">
                                        Đã bán: {product.sold || 0}
                                    </span>
                                </div>
                                
                                {product.color && product.color.length > 0 && (
                                    <div className="flex items-center mt-1 flex-wrap gap-1">
                                        <span className="text-xs text-gray-500">Màu:</span>
                                        {product.color.slice(0, 3).map((c, i) => (
                                            <span key={i} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-600">
                                                {c}
                                            </span>
                                        ))}
                                        {product.color.length > 3 && (
                                            <span className="text-xs text-gray-500">+{product.color.length - 3}</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {styles === 'grid' && (
                                <button
                                    className="w-full flex items-center justify-center gap-1 py-1.5 mt-2 bg-red-400 text-white rounded-md hover:bg-red-500 transition-colors text-sm"
                                    aria-label="Add to cart"
                                    onClick={() => add_card(product._id)}
                                >
                                    <RiShoppingCartLine size={18} />
                                    Thêm
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ShopProducts;