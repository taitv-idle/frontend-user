import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import StripePayment from '../components/StripePayment';

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Lấy dữ liệu đơn hàng từ location state
        if (location.state?.orderInfo) {
            setOrderData(location.state.orderInfo);
        } else {
            toast.error('Không tìm thấy thông tin đơn hàng');
            navigate('/cart');
        }
        setLoading(false);
    }, [location.state, navigate]);

    const handlePaymentSuccess = () => {
        // Chuyển hướng đến trang xác nhận đơn hàng
        navigate('/order-success', {
            state: {
                orderId: orderData.orderId,
                paymentMethod: 'stripe'
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!orderData) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Thanh Toán</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Thông tin đơn hàng */}
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Thông Tin Đơn Hàng</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tạm tính</span>
                                    <span className="font-medium">{(orderData.itemsPrice * 1000).toLocaleString('vi-VN')}₫</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phí vận chuyển</span>
                                    <span className="font-medium">
                                        {orderData.shippingPrice === 0 ? 'Miễn phí' : `${(orderData.shippingPrice * 1000).toLocaleString('vi-VN')}₫`}
                                    </span>
                                </div>
                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Tổng cộng</span>
                                        <span className="text-red-600">
                                            {(orderData.totalPrice * 1000).toLocaleString('vi-VN')}₫
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Thông Tin Giao Hàng</h3>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <p className="text-gray-600">
                                        {orderData.shippingInfo.name} - {orderData.shippingInfo.phone}
                                    </p>
                                    <p className="text-gray-600">
                                        {orderData.shippingInfo.address}, {orderData.shippingInfo.area}, {orderData.shippingInfo.city}, {orderData.shippingInfo.province}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form thanh toán */}
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Thanh Toán An Toàn</h2>
                            <StripePayment
                                amount={orderData.totalPrice}
                                orderId={orderData.orderId}
                                onSuccess={handlePaymentSuccess}
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;