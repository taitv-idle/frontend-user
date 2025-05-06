import React, { useEffect } from 'react';
import { FaEye, FaHeart } from "react-icons/fa";
import { RiShoppingCartLine } from "react-icons/ri";
import Rating from '../Rating';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_wishlist_products, remove_wishlist, messageClear } from '../../store/reducers/cardReducer';
import toast from 'react-hot-toast';
import EmptyWishlist from '../EmptyWishlist';

const Wishlist = () => {
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const { wishlist, successMessage } = useSelector(state => state.card);

    useEffect(() => {
        if (userInfo?.id) {
            dispatch(get_wishlist_products(userInfo.id));
        }
    }, [dispatch, userInfo?.id]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
    }, [successMessage, dispatch]);

    const handleRemoveWishlist = (productId) => {
        dispatch(remove_wishlist(productId));
        toast('Đã xóa khỏi danh sách yêu thích', {
            icon: '❤️',
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });
    };

    if (wishlist.length === 0) {
        return <EmptyWishlist />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Danh sách yêu thích</h1>

            <div className="grid grid-cols-3 gap-4">
                {wishlist.map((product) => (
                    <div
                        key={product._id}
                        className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all"
                    >
                        {/* Phần hình ảnh nhỏ gọn */}
                        <div className="relative pt-[100%] bg-gray-50">
                            {product.discount > 0 && (
                                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                                    -{product.discount}%
                                </div>
                            )}

                            <div className="absolute inset-0 flex items-center justify-center p-2">
                                <img
                                    className="w-full h-full object-contain max-h-[80%] max-w-[80%]"
                                    src={product.image}
                                    alt={product.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/images/default-product.png';
                                    }}
                                />
                            </div>

                            {/* Các nút hành động nhỏ hơn */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center gap-2 opacity-0 hover:bg-opacity-5 hover:opacity-100 transition-all">
                                <button
                                    onClick={() => handleRemoveWishlist(product._id)}
                                    className="bg-white p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors text-sm"
                                    aria-label="Xóa khỏi danh sách yêu thích"
                                >
                                    <FaHeart />
                                </button>

                                <Link
                                    to={`/product/details/${product.slug}`}
                                    className="bg-white p-2 rounded-full text-gray-700 hover:bg-indigo-500 hover:text-white transition-colors text-sm"
                                    aria-label="Xem chi tiết sản phẩm"
                                >
                                    <FaEye />
                                </Link>

                                <button
                                    className="bg-white p-2 rounded-full text-gray-700 hover:bg-green-500 hover:text-white transition-colors text-sm"
                                    aria-label="Thêm vào giỏ hàng"
                                >
                                    <RiShoppingCartLine />
                                </button>
                            </div>
                        </div>

                        {/* Thông tin sản phẩm gọn gàng */}
                        <div className="p-3">
                            <h2 className="font-medium text-sm text-gray-800 mb-1 line-clamp-2 h-10">
                                {product.name}
                            </h2>

                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-base font-bold text-indigo-600">
                                        ${product.price.toFixed(2)}
                                    </span>
                                    {product.discount > 0 && (
                                        <span className="text-xs text-gray-400 line-through block">
                                            ${(product.price / (1 - product.discount/100)).toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                <Rating ratings={product.rating} iconSize="text-xs" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;