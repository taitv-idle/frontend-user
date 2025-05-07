import React, { useEffect } from 'react';
import { FaPlus, FaSearch, FaHeart } from "react-icons/fa"; // Thay đổi icon
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Rating from '../Rating';
import { add_to_card, add_to_wishlist, messageClear } from '../../store/reducers/cardReducer';
import toast from 'react-hot-toast';

const FeatureProducts = ({ products }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const { errorMessage, successMessage } = useSelector(state => state.card);

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

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="w-[85%] mx-auto py-10">

            <div className="w-full grid grid-cols-4 md-lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-6">
                {products.map((p) => (
                    <div
                        key={p._id}
                        className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
                    >
                        {/* Product Image */}
                        <div className="relative overflow-hidden bg-gray-50">
                            {p.discount > 0 && (
                                <div className="absolute top-3 left-3 bg-gradient-to-r from-[#ff6b6b] to-[#ffa07a] text-white w-10 h-10 flex items-center justify-center rounded-full font-semibold text-xs shadow-md">
                                    -{p.discount}%
                                </div>
                            )}
                            <img
                                className="w-full h-[240px] object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                                src={p.images[0]}
                                alt={p.name}
                                loading="lazy"
                                onError={(e) => (e.target.src = '/images/default-product.jpg')}
                            />

                            {/* Action Buttons */}
                            <ul className="flex justify-center items-center gap-3 absolute w-full bottom-0 translate-y-full group-hover:-translate-y-3 transition-all duration-500 ease-in-out">
                                <li
                                    onClick={() => add_wishlist(p)}
                                    className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-[#ff6b6b] hover:text-white hover:scale-110 transition-all duration-300"
                                >
                                    <FaHeart size={16} />
                                </li>
                                <Link
                                    to={`/product/details/${p.slug}`}
                                    className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-[#ffa07a] hover:text-white hover:scale-110 transition-all duration-300"
                                >
                                    <FaSearch size={16} />
                                </Link>
                                <li
                                    onClick={() => add_card(p._id)}
                                    className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-[#4ecdc4] hover:text-white hover:scale-110 transition-all duration-300"
                                >
                                    <FaPlus size={16} />
                                </li>
                            </ul>
                        </div>

                        {/* Product Info */}
                        <div className="py-4 px-3 text-slate-700">
                            <Link to={`/product/details/${p.slug}`}>
                                <h2 className="font-semibold text-base line-clamp-2 hover:text-[#ff6b6b] transition-colors duration-300">
                                    {p.name}
                                </h2>
                            </Link>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-lg font-bold text-[#ff6b6b]">
                                    {formatPrice(p.price)}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Rating ratings={p.rating} size="small" className="space-x-0.5" />
                                    <span className="text-xs text-gray-500">({p.rating || 0})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeatureProducts;