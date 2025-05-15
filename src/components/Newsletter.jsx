import React from 'react';

const Newsletter = () => {
    return (
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
    );
};

export default Newsletter; 