import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FiMenu, FiX } from 'react-icons/fi';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    HiHome,
    HiShoppingBag,
    HiHeart,
    HiChatAlt2,
    HiLockClosed,
    HiLogout,
    HiUser,
    HiLocationMarker
} from 'react-icons/hi';
import api from '../api/api';
import { useDispatch, useSelector } from 'react-redux';
import { user_reset } from '../store/reducers/authReducer';
import { reset_count } from '../store/reducers/cardReducer';
import { FadeLoader } from 'react-spinners';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [filterShow, setFilterShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const { userInfo } = useSelector(state => state.auth);

    // Đóng menu khi click ra ngoài trên mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterShow && !event.target.closest('.sidebar') && !event.target.closest('.menu-button')) {
                setFilterShow(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [filterShow]);

    // Đóng menu khi chuyển route trên mobile
    useEffect(() => {
        setFilterShow(false);
    }, [location]);

    const logout = async () => {
        try {
            setLoading(true);
            await api.get('/customer/logout');
            localStorage.removeItem('customerToken');
            dispatch(user_reset());
            dispatch(reset_count());
            toast.success('Đăng xuất thành công');
            navigate('/login');
        } catch (error) {
            console.error('Lỗi đăng xuất:', error.response?.data);
            toast.error('Có lỗi xảy ra khi đăng xuất');
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { path: '/dashboard', icon: HiHome, label: 'Bảng điều khiển' },
        { path: '/dashboard/my-orders', icon: HiShoppingBag, label: 'Đơn hàng của tôi' },
        { path: '/dashboard/my-wishlist', icon: HiHeart, label: 'Yêu thích' },
        { path: '/dashboard/my-addresses', icon: HiLocationMarker, label: 'Địa chỉ giao hàng' },
        { path: '/dashboard/chat', icon: HiChatAlt2, label: 'Trò chuyện' },
        { path: '/dashboard/change-password', icon: HiLockClosed, label: 'Đổi mật khẩu' }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <div className="flex-grow mt-5">
                <div className="w-[90%] mx-auto">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setFilterShow(!filterShow)}
                        className="md:hidden menu-button flex items-center gap-2 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                    >
                        {filterShow ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
                        <span>{filterShow ? 'Đóng menu' : 'Mở menu'}</span>
                    </button>

                    {/* User Info Card - Mobile Only */}
                    <div className="md:hidden mt-4 bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <HiUser className="text-2xl text-red-500" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800">{userInfo?.name}</h3>
                                <p className="text-sm text-gray-500">{userInfo?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-full mx-auto">
                    <div className="py-5 flex md:w-[90%] mx-auto relative">
                        {/* Sidebar */}
                        <div 
                            className={`sidebar rounded-lg z-50 md:relative ${
                                filterShow ? 'left-0' : '-left-[270px] md:left-0'
                            } w-[270px] ml-4 bg-white shadow-xl transition-all duration-300 fixed md:static`}
                        >
                            {/* User Info Card - Desktop Only */}
                            <div className="hidden md:block p-4 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                        <HiUser className="text-2xl text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">{userInfo?.name}</h3>
                                        <p className="text-sm text-gray-500">{userInfo?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <ul className="py-3 text-gray-700 px-4">
                                {menuItems.map((item) => (
                                    <li key={item.path} className="group">
                                        <Link
                                            to={item.path}
                                            className={`flex items-center gap-3 py-3 px-2 rounded-lg transition-all ${
                                                location.pathname === item.path
                                                    ? 'bg-red-50 text-red-600'
                                                    : 'group-hover:bg-red-50 group-hover:text-red-600'
                                            }`}
                                        >
                                            <item.icon className={`text-xl ${
                                                location.pathname === item.path ? 'text-red-500' : 'text-gray-500'
                                            }`} />
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                ))}
                                <li className="group mt-4">
                                    <button
                                        onClick={logout}
                                        disabled={loading}
                                        className="w-full flex items-center gap-3 py-3 px-2 rounded-lg group-hover:bg-red-50 group-hover:text-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <FadeLoader color="#ef4444" height={15} width={2} margin={2} />
                                        ) : (
                                            <>
                                                <HiLogout className="text-xl text-red-500" />
                                                <span>Đăng xuất</span>
                                            </>
                                        )}
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Main Content */}
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