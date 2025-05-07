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
        <div className="w-full mx-auto py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {products.map((p) => (
                    <div
                        key={p._id}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative"
                    >
                {/* Badge giảm giá */}
                            {p.discount > 0 && (
                  <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-[#ff6b6b] to-[#ffa07a] text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg pointer-events-none">
                                    -{p.discount}%
                                </div>
                            )}
      
                {/* Ảnh sản phẩm */}
                <div className="relative bg-gray-50 flex items-center justify-center h-56 overflow-hidden">
                            <img
                    className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                                src={p.images[0]}
                                alt={p.name}
                                loading="lazy"
                                onError={(e) => (e.target.src = '/images/default-product.jpg')}
                            />
                  {/* Nút thao tác nhanh ở giữa ảnh */}
                  <ul className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 z-30">
                                <li
                                    onClick={() => add_wishlist(p)}
                      title="Yêu thích"
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-[#ff6b6b] hover:text-white hover:scale-110 transition-all duration-300 shadow"
                                >
                                    <FaHeart size={16} />
                                </li>
                                <Link
                                    to={`/product/details/${p.slug}`}
                      title="Xem chi tiết"
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-[#ffa07a] hover:text-white hover:scale-110 transition-all duration-300 shadow"
                                >
                                    <FaSearch size={16} />
                                </Link>
                                <li
                                    onClick={() => add_card(p._id)}
                      title="Thêm vào giỏ"
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-[#4ecdc4] hover:text-white hover:scale-110 transition-all duration-300 shadow"
                                >
                                    <FaPlus size={16} />
                                </li>
                            </ul>
                        </div>

                {/* Thông tin sản phẩm */}
                <div className="py-4 px-4 text-slate-700 flex flex-col gap-2">
                            <Link to={`/product/details/${p.slug}`}>
                                <h2 className="font-semibold text-base line-clamp-2 hover:text-[#ff6b6b] transition-colors duration-300">
                                    {p.name}
                                </h2>
                            </Link>
                  <div className="flex justify-between items-center mt-1">
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