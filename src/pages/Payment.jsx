import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { confirm_cod_payment, resetPaymentStatus } from '../store/reducers/orderReducer';
import StripePayment from '../components/StripePayment';
import { FaCreditCard, FaMoneyBillWave, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../api/api';

const Payment = () => {
    const { state: { price, items, orderId, paymentMethod: initialMethod } } = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { paymentStatus } = useSelector(state => state.order);

    const [paymentMethod, setPaymentMethod] = useState(initialMethod || 'stripe');
    const [codConfirmed, setCodConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);

    const formattedPrice = (price * 1000).toLocaleString('vi-VN');

    useEffect(() => {
        dispatch(resetPaymentStatus());
    }, [dispatch]);

    useEffect(() => {
        if (paymentStatus === 'succeeded') {
            toast.success('Thanh toán thành công!');
            navigate('/order-confirmation', {
                state: { orderId, paymentMethod }
            });
        } else if (paymentStatus === 'failed') {
            toast.error('Thanh toán thất bại!');
        }
    }, [paymentStatus, navigate, orderId, paymentMethod]);

    const handleCodPayment = async () => {
        try {
            setLoading(true);
            await dispatch(confirm_cod_payment(orderId)).unwrap();
            setCodConfirmed(true);
            toast.success('Xác nhận COD thành công!');
        } catch (error) {
            toast.error(error.message || 'Xác nhận COD thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleStripeSuccess = async () => {
        try {
            setLoading(true);
            // Xác nhận với backend
            const { data } = await api.patch(`/order/confirm-stripe/${orderId}`);
            toast.success('Thanh toán Stripe thành công!');
            navigate('/order-confirmation', {
                state: {
                    orderId,
                    paymentMethod: 'stripe',
                    order: data.order
                }
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Xác nhận thanh toán thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                        <FaArrowLeft className="mr-2" />
                        Quay lại
                    </button>
                </div>
            </header>

            <main className="flex-grow py-8">
                <div className="container mx-auto px-4 max-w-7xl">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Thanh Toán Đơn Hàng</h1>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Phương thức thanh toán */}
                        <div className="lg:w-8/12">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <h2 className="text-xl font-bold text-gray-800 p-6 border-b">
                                    Chọn Phương Thức Thanh Toán
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                                    {/* Thẻ Stripe */}
                                    <div
                                        onClick={() => setPaymentMethod('stripe')}
                                        className={`p-6 cursor-pointer transition-all ${
                                            paymentMethod === 'stripe'
                                                ? 'bg-blue-50 border-blue-500 border-b-2'
                                                : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full ${
                                                paymentMethod === 'stripe'
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}>
                                                <FaCreditCard className="text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-800">Thẻ tín dụng/ghi nợ</h3>
                                                <p className="text-sm text-gray-500">Thanh toán an toàn qua Stripe</p>
                                            </div>
                                        </div>
                                        {paymentMethod === 'stripe' && (
                                            <div className="mt-4 animate-fadeIn">
                                                <StripePayment
                                                    amount={price}
                                                    orderId={orderId}
                                                    onSuccess={handleStripeSuccess}
                                                    disabled={loading}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Thanh toán COD */}
                                    <div
                                        onClick={() => setPaymentMethod('cod')}
                                        className={`p-6 cursor-pointer transition-all ${
                                            paymentMethod === 'cod'
                                                ? 'bg-green-50 border-green-500 border-b-2'
                                                : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full ${
                                                paymentMethod === 'cod'
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}>
                                                <FaMoneyBillWave className="text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-800">Thanh toán khi nhận hàng</h3>
                                                <p className="text-sm text-gray-500">COD (Cash on Delivery)</p>
                                            </div>
                                        </div>
                                        {paymentMethod === 'cod' && (
                                            <div className="mt-4 animate-fadeIn">
                                                <div className="bg-green-50 p-4 rounded-md border border-green-100">
                                                    <h4 className="font-medium text-green-800 mb-2">
                                                        Thông tin thanh toán COD
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mb-4">
                                                        Bạn sẽ thanh toán tiền mặt khi nhận được hàng. Vui lòng kiểm tra hàng hóa
                                                        trước khi thanh toán.
                                                    </p>
                                                    <button
                                                        onClick={handleCodPayment}
                                                        disabled={codConfirmed || loading}
                                                        className={`w-full py-2 rounded-md font-medium transition ${
                                                            codConfirmed
                                                                ? 'bg-green-600 text-white'
                                                                : 'bg-green-500 hover:bg-green-600 text-white'
                                                        }`}
                                                    >
                                                        {loading ? (
                                                            'Đang xử lý...'
                                                        ) : codConfirmed ? (
                                                            <>
                                                                <FaCheckCircle className="inline mr-2" />
                                                                Đã xác nhận COD
                                                            </>
                                                        ) : (
                                                            'Xác nhận thanh toán COD'
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tóm tắt đơn hàng */}
                        <div className="lg:w-4/12">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">Tóm Tắt Đơn Hàng</h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tổng sản phẩm</span>
                                        <span className="font-medium">{items} sản phẩm</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tạm tính</span>
                                        <span className="font-medium">{formattedPrice}₫</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phí vận chuyển</span>
                                        <span className="font-medium">0₫</span>
                                    </div>

                                    <div className="pt-3 border-t border-gray-200">
                                        <div className="flex justify-between text-lg font-semibold">
                                            <span>Tổng thanh toán</span>
                                            <span className="text-green-600">{formattedPrice}₫</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                    <h4 className="font-medium text-blue-800 text-sm mb-2">Chính sách thanh toán</h4>
                                    <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                                        <li>Chúng tôi cam kết bảo mật thông tin thanh toán của bạn</li>
                                        <li>Đơn hàng sẽ được xử lý trong vòng 24 giờ</li>
                                        <li>Hoàn tiền 100% nếu không hài lòng</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Payment;