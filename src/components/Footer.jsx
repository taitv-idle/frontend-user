
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaHeart } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { useSelector } from 'react-redux';

const Footer = () => {
    const navigate = useNavigate();
    const { userInfo } = useSelector(state => state.auth);
    const { card_product_count, wishlist_count } = useSelector(state => state.card);

    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white text-gray-700">
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-wrap justify-between">
                    {/* Cột 1: Thông tin công ty */}
                    <div className="flex-1 mb-8">
                        <Link to="/" className="inline-block mb-4">
                            <img
                                className="w-32 h-auto sm:w-40"
                                src="/images/logo.png"
                                alt="Logo Công Ty"
                            />
                        </Link>
                        <p className="text-gray-600 text-sm max-w-xs">
                            Chúng tôi cung cấp các sản phẩm chất lượng cao với dịch vụ khách hàng xuất sắc.
                        </p>
                        <div className="flex items-center space-x-4 mt-6">
                            {[
                                { icon: <FaFacebookF size={18} />, href: "#", label: "Facebook" },
                                { icon: <FaTwitter size={18} />, href: "#", label: "Twitter" },
                                { icon: <FaInstagram size={18} />, href: "#", label: "Instagram" }
                            ].map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300"
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Cột 2: Liên kết hữu ích */}
                    <div className="flex-1 mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Liên Kết Hữu Ích</h3>
                        <ul className="space-y-3 text-sm">
                            {[
                                { to: "/about", label: "Về Chúng Tôi" },
                                { to: "/shop", label: "Giới Thiệu Cửa Hàng" },
                                { to: "/delivery", label: "Thông Tin Giao Hàng" },
                                { to: "/privacy", label: "Chính Sách Bảo Mật" },
                                { to: "/blog", label: "Blog" },
                                { to: "/services", label: "Dịch Vụ" },
                                { to: "/contact", label: "Liên Hệ" }
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.to}
                                        className="hover:text-orange-500 transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Cột 3: Liên kết nhanh */}
                    <div className="flex-1 mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Liên Kết Nhanh</h3>
                        <ul className="space-y-3 text-sm">
                            {[
                                { to: "/account", label: "Tài Khoản Của Tôi" },
                                { to: "/orders", label: "Theo Dõi Đơn Hàng" },
                                { to: "/wishlist", label: "Danh Sách Yêu Thích" },
                                { to: "/cart", label: "Giỏ Hàng" },
                                { to: "/faq", label: "Câu Hỏi Thường Gặp" },
                                { to: "/terms", label: "Điều Khoản & Điều Kiện" }
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.to}
                                        className="hover:text-orange-500 transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Cột 4: Đăng ký bản tin */}
                    <div className="flex-1 mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Đăng Ký Bản Tin</h3>
                        <p className="text-sm text-gray-600 mb-4">Nhận thông tin mới nhất về sản phẩm và ưu đãi đặc biệt.</p>
                        <form className="flex flex-col space-y-3">
                            <input
                                type="email"
                                placeholder="Nhập email của bạn"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-700 placeholder-gray-400 text-sm"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 text-sm"
                            >
                                Đăng Ký Ngay
                            </button>
                        </form>
                        <p className="text-xs text-gray-500 mt-3 text-center">
                            Khi đăng ký, bạn đồng ý với <Link to="/privacy" className="text-orange-500 hover:underline">điều khoản bảo mật</Link>.
                        </p>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex flex-col items-center gap-4 text-sm text-gray-600 sm:flex-row sm:justify-between mb-5">
                        <p>
                            © {currentYear} N4Shop. Mọi quyền được bảo lưu. Thiết kế với <FaHeart className="inline text-orange-500 mx-1" /> bởi Taitruongvan
                        </p>
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                            <div className="flex gap-4">
                                <Link to="/privacy" className="hover:text-orange-500 transition-colors">
                                    Chính sách bảo mật
                                </Link>
                                <Link to="/terms" className="hover:text-orange-500 transition-colors">
                                    Điều khoản sử dụng
                                </Link>
                            </div>
                            <div className="flex items-center gap-2">
                                <img src="/images/payment/visa.png" alt="Visa" className="h-5" />
                                <img src="/images/payment/mastercard.png" alt="Mastercard" className="h-5" />
                                <img src="/images/payment/paypal.png" alt="PayPal" className="h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-6 right-6 space-y-3 z-50 lg:block hidden">
                <button
                    onClick={() => navigate(userInfo ? '/card' : '/login')}
                    className="relative w-12 h-12 bg-orange-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                    aria-label="Giỏ hàng"
                >
                    <FaCartShopping className="text-xl" />
                    {card_product_count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {card_product_count}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => navigate(userInfo ? '/dashboard/my-wishlist' : '/login')}
                    className="relative w-12 h-12 bg-orange-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                    aria-label="Danh sách yêu thích"
                >
                    <FaHeart className="text-xl" />
                    {wishlist_count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {wishlist_count}
                        </span>
                    )}
                </button>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 py-2 z-50 lg:hidden">
                <div className="flex justify-around items-center">
                    {[
                        { to : "/", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, label: "Trang chủ" },
                        { to: "/shops", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>, label: "Cửa hàng" },
                        { to: userInfo ? '/card' : '/login', icon: <FaCartShopping className="w-6 h-6" />, label: "Giỏ hàng", count: card_product_count },
                        { to: userInfo ? '/dashboard/my-wishlist' : '/login', icon: <FaHeart className="w-6 h-6" />, label: "Yêu thích", count: wishlist_count },
                        { to: userInfo ? '/dashboard' : '/login', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, label: "Tài khoản" }
                    ].map((item, index) => (
                        <Link key={index} to={item.to} className="flex flex-col items-center text-gray-500 hover:text-orange-500 transition-colors">
                            <div className="relative">
                                {item.icon}
                                {item.count > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                        {item.count}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs mt-1">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
};

export default Footer;