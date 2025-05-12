import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get_products } from '../store/reducers/homeReducer';
import Header from '../components/Header';
import Banner from '../components/Banner';
import Categorys from '../components/Categorys';
import FeatureProducts from '../components/products/FeatureProducts';
import Products from '../components/products/Products';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import LoadingSkeleton from '../components/HomeSkeleton';
import AIChatButton from '../components/AIChatButton';
import AIChatModal from '../components/AIChatModal';

const Home = () => {
    const dispatch = useDispatch();
    const { products, latest_product, topRated_product, discount_product, loading } = useSelector(state => state.home);
    const [chatOpen, setChatOpen] = useState(false);
    const [currentChatType, setCurrentChatType] = useState('openai');

    useEffect(() => {
        dispatch(get_products());
    }, [dispatch]);

    const handleOpenChat = () => {
        setChatOpen(true);
    };

    const handleCloseChat = () => {
        setChatOpen(false);
    };

    const handleChatTypeChange = (type) => {
        setCurrentChatType(type);
    };

    if (loading) return <LoadingSkeleton />;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />

            <main className="flex-grow">
                {/* Hero Section with Banner */}
                <section className="relative">
                    <Banner />
                </section>

                {/* Categories Section */}
                <section className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                Danh Mục Sản Phẩm
                            </h2>
                            <div className="w-20 h-1 bg-gradient-to-r from-[#ff6b6b] to-[#ffa07a] mx-auto rounded-full"></div>
                        </div>
                        <Categorys />
                    </div>
                </section>

                {/* Featured Products Section */}
                <section className="py-20 bg-gradient-to-b from-white to-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center relative inline-block">
                            Sản Phẩm Nổi Bật
                            <span className="block w-24 h-1 bg-gradient-to-r from-[#ff6b6b] to-[#ffa07a] mx-auto rounded-full mt-2"></span>
                        </h2>
                        <FeatureProducts products={products} />
                    </div>
                </section>

                {/* Products Grid Section */}
                <section className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <Products
                                    title="Sản Phẩm Mới"
                                    products={latest_product}
                                    bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
                                />
                            </div>

                            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <Products
                                    title="Bán Chạy Nhất"
                                    products={topRated_product}
                                    bgColor="bg-gradient-to-br from-rose-50 to-rose-100"
                                />
                            </div>

                            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <Products
                                    title="Khuyến Mãi Hot"
                                    products={discount_product}
                                    bgColor="bg-gradient-to-br from-emerald-50 to-emerald-100"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-12 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-semibold mb-2">Chất Lượng Cao</h3>
                                <p className="text-sm text-gray-600">Cam kết chất lượng sản phẩm tốt nhất</p>
                            </div>

                            <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-semibold mb-2">Giao Hàng Nhanh</h3>
                                <p className="text-sm text-gray-600">Giao hàng toàn quốc trong 24h</p>
                            </div>

                            <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-semibold mb-2">Thanh Toán An Toàn</h3>
                                <p className="text-sm text-gray-600">Nhiều phương thức thanh toán</p>
                            </div>

                            <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-semibold mb-2">Hỗ Trợ 24/7</h3>
                                <p className="text-sm text-gray-600">Đội ngũ hỗ trợ nhiệt tình</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Newsletter Section */}
                <section className="py-12 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-3">
                            Đăng Ký Nhận Thông Tin
                        </h2>
                        <p className="text-blue-100 mb-6 max-w-2xl mx-auto text-sm">
                            Nhận thông tin về sản phẩm mới và khuyến mãi đặc biệt. Chúng tôi sẽ không gửi spam.
                        </p>
                        <div className="max-w-md mx-auto">
                            <div className="flex gap-3">
                                <input
                                    type="email"
                                    placeholder="Nhập email của bạn"
                                    className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                                />
                                <button className="px-5 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-sm">
                                    Đăng Ký
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <ScrollToTop />
            
            {/* AI Fashion Assistant Chat Button and Modal */}
            <AIChatButton 
                onClick={handleOpenChat} 
                chatType={currentChatType} 
            />
            <AIChatModal 
                isOpen={chatOpen} 
                onClose={handleCloseChat} 
                onChatTypeChange={handleChatTypeChange}
            />
        </div>
    );
};

export default Home;