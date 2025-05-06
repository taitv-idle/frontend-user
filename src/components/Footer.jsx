import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaPinterestP, FaCartShopping, FaHeart } from "react-icons/fa6";
import { useSelector } from 'react-redux';

const Footer = () => {
    const { userInfo } = useSelector(state => state.auth);
    const { card_product_count, wishlist_count } = useSelector(state => state.card);
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-rose-50 relative">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Column 1: Brand Info */}
                    <div className="lg:pr-8">
                        <Link to="/" className="inline-block mb-6">
                            <img
                                className="w-36 h-auto"
                                src="/images/logo.png"
                                alt="Fashion Store Logo"
                            />
                        </Link>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            Khám phá BST mới nhất từ các nhà thiết kế hàng đầu.
                            Cập nhật xu hướng thời trang mỗi ngày.
                        </p>
                        <div className="flex space-x-3">
                            {[
                                { Icon: FaFacebookF, href: "https://facebook.com" },
                                { Icon: FaInstagram, href: "https://instagram.com" },
                                { Icon: FaPinterestP, href: "https://pinterest.com" }
                            ].map(({ Icon, href }, index) => (
                                <a
                                    key={index}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-rose-100 rounded-full text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                                >
                                    <Icon className="text-base" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Customer Service */}
                    <div className="lg:pl-4">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">Hỗ Trợ Khách Hàng</h3>
                        <nav className="space-y-2">
                            {[
                                { to: "/contact", label: "Liên hệ" },
                                { to: "/shipping", label: "Vận chuyển" },
                                { to: "/returns", label: "Đổi trả" },
                                { to: "/payment", label: "Thanh toán" },
                                { to: "/faq", label: "FAQ" }
                            ].map((link, index) => (
                                <Link
                                    key={index}
                                    to={link.to}
                                    className="block text-sm text-gray-600 hover:text-rose-600 transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Column 3: Company Info */}
                    <div className="lg:pl-4">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">Về Chúng Tôi</h3>
                        <nav className="space-y-2">
                            {[
                                { to: "/about", label: "Giới thiệu" },
                                { to: "/blog", label: "Tạp chí" },
                                { to: "/careers", label: "Tuyển dụng" },
                                { to: "/stores", label: "Cửa hàng" },
                                { to: "/privacy", label: "Bảo mật" }
                            ].map((link, index) => (
                                <Link
                                    key={index}
                                    to={link.to}
                                    className="block text-sm text-gray-600 hover:text-rose-600 transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div className="lg:pl-4">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">Nhận Ưu Đãi</h3>
                        <div className="space-y-3">
                            <input
                                type="email"
                                placeholder="Email của bạn"
                                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => alert('Đăng ký thành công!')}
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg text-sm transition-colors"
                            >
                                Đăng ký ngay
                            </button>
                        </div>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="border-t border-gray-100 mt-10 pt-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 text-sm text-gray-600">
                        <div className="text-center sm:text-left">
                            © {currentYear} FashionStore. Bảo lưu mọi quyền
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex space-x-4">
                                <Link to="/privacy" className="hover:text-rose-600">
                                    Bảo mật
                                </Link>
                                <Link to="/terms" className="hover:text-rose-600">
                                    Điều khoản
                                </Link>
                            </div>
                            <div className="flex items-center space-x-2">
                                <img src="/images/payment/visa.png"
                                     className="h-4" alt="Visa" />
                                <img src="/images/payment/mastercard.png"
                                     className="h-4" alt="Mastercard" />
                                <img src="/images/payment/paypal.png"
                                     className="h-4" alt="PayPal" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Mobile Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg lg:hidden z-50">
                <div className="flex justify-around py-2 px-2">
                    {[
                        {
                            to: "/",
                            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>,
                            label: "Trang chủ"
                        },
                        {
                            to: "/shop",
                            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>,
                            label: "Mua sắm"
                        },
                        {
                            to: userInfo ? '/card' : '/login',
                            icon: <FaCartShopping className="w-5 h-5" />,
                            label: "Giỏ hàng",
                            count: card_product_count
                        },
                        {
                            to: userInfo ? '/wishlist' : '/login',
                            icon: <FaHeart className="w-5 h-5" />,
                            label: "Yêu thích",
                            count: wishlist_count
                        }
                    ].map((item, index) => (
                        <Link
                            key={index}
                            to={item.to}
                            className="flex flex-col items-center text-gray-500 hover:text-rose-600 transition-colors px-2"
                        >
                            <div className="relative">
                                {item.icon}
                                {item.count > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                                        {item.count}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] mt-0.5">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
};

export default Footer;