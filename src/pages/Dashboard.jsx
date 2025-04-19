import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FiMenu } from 'react-icons/fi';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
    HiHome,
    HiShoppingBag,
    HiHeart,
    HiChatAlt2,
    HiLockClosed,
    HiLogout
} from 'react-icons/hi';
import api from '../api/api';
import { useDispatch } from 'react-redux';
import { user_reset } from '../store/reducers/authReducer';
import { reset_count } from '../store/reducers/cardReducer';

const Dashboard = () => {
    const [filterShow, setFilterShow] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const logout = async () => {
        try {
            await api.get('/customer/logout'); // Đã bỏ destructuring không cần thiết
            localStorage.removeItem('customerToken');
            dispatch(user_reset());
            dispatch(reset_count());
            navigate('/login');
        } catch (error) {
            console.error('Lỗi đăng xuất:', error.response?.data);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Header />

            <div className="flex-grow mt-5">
                <div className="w-[90%] mx-auto hidden md:block">
                    <button
                        onClick={() => setFilterShow(!filterShow)}
                        className="py-2 px-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md"
                    >
                        <FiMenu className="inline mr-2" />
                        {filterShow ? 'Ẩn menu' : 'Hiện menu'}
                    </button>
                </div>

                <div className="h-full mx-auto">
                    <div className="py-5 flex md:w-[90%] mx-auto relative">
                        {/* Sidebar */}
                        <div className={`rounded-lg z-50 md:absolute ${filterShow ? 'left-0' : '-left-[270px]'} w-[270px] ml-4 bg-white shadow-xl transition-all duration-300`}>
                            <ul className="py-3 text-gray-700 px-4">
                                <li className="group">
                                    <Link
                                        to="/dashboard"
                                        className="flex items-center gap-3 py-3 px-2 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all"
                                    >
                                        <HiHome className="text-xl text-indigo-500" />
                                        <span>Bảng điều khiển</span>
                                    </Link>
                                </li>
                                <li className="group">
                                    <Link
                                        to="/dashboard/my-orders"
                                        className="flex items-center gap-3 py-3 px-2 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all"
                                    >
                                        <HiShoppingBag className="text-xl text-indigo-500" />
                                        <span>Đơn hàng của tôi</span>
                                    </Link>
                                </li>
                                <li className="group">
                                    <Link
                                        to="/dashboard/my-wishlist"
                                        className="flex items-center gap-3 py-3 px-2 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all"
                                    >
                                        <HiHeart className="text-xl text-indigo-500" />
                                        <span>Yêu thích</span>
                                    </Link>
                                </li>
                                <li className="group">
                                    <Link
                                        to="/dashboard/chat"
                                        className="flex items-center gap-3 py-3 px-2 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all"
                                    >
                                        <HiChatAlt2 className="text-xl text-indigo-500" />
                                        <span>Trò chuyện</span>
                                    </Link>
                                </li>
                                <li className="group">
                                    <Link
                                        to="/dashboard/change-password"
                                        className="flex items-center gap-3 py-3 px-2 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all"
                                    >
                                        <HiLockClosed className="text-xl text-indigo-500" />
                                        <span>Đổi mật khẩu</span>
                                    </Link>
                                </li>
                                <li className="group">
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-3 py-3 px-2 rounded-lg group-hover:bg-red-50 group-hover:text-red-600 transition-all"
                                    >
                                        <HiLogout className="text-xl text-red-500" />
                                        <span>Đăng xuất</span>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Nội dung chính */}
                        <div className="w-[calc(100%-270px)] md:w-full">
                            <div className="mx-4 md:mx-0 bg-white rounded-lg shadow-sm p-6 min-h-[500px]">
                                <Outlet />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Dashboard;