import React, { useEffect } from 'react';
import { FaEye, FaTrash } from "react-icons/fa";
import { RiShoppingCartLine } from "react-icons/ri";
import Rating from '../Rating';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_wishlist_products, remove_wishlist, messageClear } from '../../store/reducers/cardReducer';
import toast from 'react-hot-toast';
import EmptyWishlist from '../EmptyWishlist';
import { ClipLoader } from 'react-spinners';

const Wishlist = () => {
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const { wishlist, successMessage, isLoading } = useSelector(state => state.card);

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
        toast.success('Đã xóa khỏi danh sách yêu thích');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <ClipLoader color="#ef4444" size={40} />
            </div>
        );
    }

    if (wishlist.length === 0) {
        return <EmptyWishlist />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Danh sách yêu thích</h1>
                <span className="text-sm text-gray-500">{wishlist.length} sản phẩm</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((product) => (
                    <div
                        key={product._id}
                        className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all group"
                    >
                        {/* Product Image */}
                        <div className="relative pt-[100%] bg-gray-50">
                            {product.discount > 0 && (
                                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                                    -{product.discount}%
                                </div>
                            )}

                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                <img
                                    className="w-full h-full object-contain max-h-[80%] max-w-[80%] group-hover:scale-105 transition-transform duration-300"
                                    src={product.image}
                                    alt={product.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/images/default-product.png';
                                    }}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    onClick={() => handleRemoveWishlist(product._id)}
                                    className="bg-white p-3 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-md"
                                    aria-label="Xóa khỏi danh sách yêu thích"
                                >
                                    <FaTrash />
                                </button>

                                <Link
                                    to={`/product/details/${product.slug}`}
                                    className="bg-white p-3 rounded-full text-gray-700 hover:bg-indigo-500 hover:text-white transition-colors shadow-md"
                                    aria-label="Xem chi tiết sản phẩm"
                                >
                                    <FaEye />
                                </Link>

                                <button
                                    className="bg-white p-3 rounded-full text-gray-700 hover:bg-green-500 hover:text-white transition-colors shadow-md"
                                    aria-label="Thêm vào giỏ hàng"
                                >
                                    <RiShoppingCartLine />
                                </button>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                            <Link 
                                to={`/product/details/${product.slug}`}
                                className="block"
                            >
                                <h2 className="font-medium text-gray-800 mb-2 line-clamp-2 h-12 hover:text-red-500 transition-colors">
                                    {product.name}
                                </h2>
                            </Link>

                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-lg font-bold text-red-500">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                    </span>
                                    {product.discount > 0 && (
                                        <span className="text-sm text-gray-400 line-through block">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price / (1 - product.discount/100))}
                                        </span>
                                    )}
                                </div>

                                <Rating ratings={product.rating} iconSize="text-sm" />
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-4 flex items-center justify-between gap-2">
                                <button
                                    onClick={() => handleRemoveWishlist(product._id)}
                                    className="flex-1 flex items-center justify-center gap-2 text-sm text-red-500 hover:text-red-600 py-2 border border-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <FaTrash className="text-xs" />
                                    Xóa
                                </button>
                                <Link
                                    to={`/product/details/${product.slug}`}
                                    className="flex-1 flex items-center justify-center gap-2 text-sm text-white bg-red-500 hover:bg-red-600 py-2 rounded-lg transition-colors"
                                >
                                    <FaEye className="text-xs" />
                                    Xem chi tiết
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;