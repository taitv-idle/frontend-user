import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import StripePayment from '../components/StripePayment';
import { confirm_cod_payment } from '../store/reducers/orderReducer';
import { reset_count, clear_cart } from '../store/reducers/cardReducer';
import { FiCreditCard, FiTruck } from 'react-icons/fi';

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingCod, setProcessingCod] = useState(false);
    const [activePaymentMethod, setActivePaymentMethod] = useState('stripe');

    useEffect(() => {
        // Lấy dữ liệu đơn hàng từ location state
        if (location.state?.orderInfo) {
            console.log('Payment page received order info:', location.state.orderInfo);
            setOrderData(location.state.orderInfo);
            
            // Set payment method from order data or default to stripe
            if (location.state.orderInfo.paymentMethod) {
                setActivePaymentMethod(location.state.orderInfo.paymentMethod);
            }
            
            setLoading(false);
        } else {
            console.error('No order info in location state');
            toast.error('Không tìm thấy thông tin đơn hàng');
            navigate('/dashboard/my-orders');
        }
    }, [location.state, navigate]);

    const handlePaymentSuccess = () => {
        // Không cần làm gì ở đây vì StripePayment sẽ tự chuyển hướng
        console.log('Payment success callback');
    };
    
    const handleCodPayment = async () => {
        if (!orderData || !orderData.orderId) {
            toast.error('Không tìm thấy thông tin đơn hàng');
            return;
        }
        
        try {
            setProcessingCod(true);
            const toastId = toast.loading('Đang xử lý thanh toán...');
            console.log('Processing COD payment for order:', orderData.orderId);
            
            // Gọi API xác nhận COD và unwrap kết quả
            const result = await dispatch(confirm_cod_payment(orderData.orderId)).unwrap();
            console.log('COD payment confirmation result:', result);
            
            // Xóa giỏ hàng trên server
            if (userInfo && userInfo.id) {
                try {
                    await dispatch(clear_cart(userInfo.id)).unwrap();
                    console.log('Successfully cleared cart on server');
                } catch (cartError) {
                    console.error('Error clearing cart on server:', cartError);
                    // Không dừng quy trình nếu xóa giỏ hàng thất bại
                }
            }
            
            // Xóa giỏ hàng sau khi đặt hàng COD thành công
            try {
                dispatch(reset_count());
                localStorage.removeItem('cartItems');
                localStorage.removeItem('cartCount');
            } catch (error) {
                console.error('Error clearing local cart:', error);
            }
            
            // Hiển thị thông báo thành công
            toast.dismiss(toastId);
            if (result && result.message) {
                toast.success(result.message || 'Đặt hàng COD thành công!');
            } else {
                toast.success('Đặt hàng COD thành công!');
            }
            
            // Chuyển hướng về trang danh sách đơn hàng
            navigate('/dashboard/my-orders');
        } catch (error) {
            console.error('COD payment error:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi xác nhận thanh toán COD');
        } finally {
            setProcessingCod(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Thông tin đơn hàng */}
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Thông Tin Đơn Hàng</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Mã đơn hàng</span>
                                    <span className="font-medium">#{orderData.orderId.slice(-8).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tổng tiền</span>
                                    <span className="font-medium text-red-600">{orderData.totalPrice.toLocaleString('vi-VN')}₫</span>
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
                            
                            {/* Payment Method Selection */}
                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Phương thức thanh toán</h3>
                                <div className="space-y-3 mt-4">
                                    <div 
                                        className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${activePaymentMethod === 'cod' ? 'border-red-500 bg-red-50' : ''}`}
                                        onClick={() => setActivePaymentMethod('cod')}
                                    >
                                        <div className="flex items-center h-5">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                checked={activePaymentMethod === 'cod'}
                                                onChange={() => setActivePaymentMethod('cod')}
                                                className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                                            />
                                        </div>
                                        <div className="ml-3 flex items-center">
                                            <FiTruck className="h-5 w-5 text-gray-400 mr-2" />
                                            <div>
                                                <span className="block font-medium text-gray-700">Thanh toán khi nhận hàng (COD)</span>
                                                <span className="block text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div 
                                        className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${activePaymentMethod === 'stripe' ? 'border-red-500 bg-red-50' : ''}`}
                                        onClick={() => setActivePaymentMethod('stripe')}
                                    >
                                        <div className="flex items-center h-5">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                checked={activePaymentMethod === 'stripe'}
                                                onChange={() => setActivePaymentMethod('stripe')}
                                                className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                                            />
                                        </div>
                                        <div className="ml-3 flex items-center">
                                            <FiCreditCard className="h-5 w-5 text-gray-400 mr-2" />
                                            <div>
                                                <span className="block font-medium text-gray-700">Thanh toán qua thẻ (Stripe)</span>
                                                <span className="block text-sm text-gray-500">Thanh toán an toàn qua thẻ Visa, Mastercard</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                                    <p className="text-xs text-blue-700 font-medium">Lưu ý:</p>
                                    <p className="text-xs text-blue-700">Đây là môi trường thanh toán test. Vui lòng sử dụng thẻ test của Stripe để thử nghiệm thanh toán.</p>
                                </div>
                            </div>
                        </div>

                        {/* Form thanh toán */}
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                {activePaymentMethod === 'stripe' ? 'Thanh Toán An Toàn Qua Thẻ' : 'Xác Nhận Đặt Hàng COD'}
                            </h2>
                            
                            {activePaymentMethod === 'stripe' ? (
                                <StripePayment
                                    amount={orderData.totalPrice}
                                    orderId={orderData.orderId}
                                    onSuccess={handlePaymentSuccess}
                                    disabled={loading}
                                />
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-md">
                                        <p className="text-sm text-yellow-700">
                                            Bạn sẽ thanh toán khi nhận được hàng. Vui lòng đảm bảo thông tin địa chỉ nhận hàng chính xác.
                                        </p>
                                    </div>
                                    
                                    <button
                                        onClick={handleCodPayment}
                                        disabled={processingCod}
                                        className={`w-full py-3 rounded-md font-medium text-white transition ${
                                            processingCod ? 'bg-red-400' : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                    >
                                        {processingCod ? 'Đang xử lý...' : 'Xác nhận đặt hàng COD'}
                                    </button>
                                    
                                    <div className="mt-4 text-center">
                                        <p className="text-xs text-gray-500">
                                            Bằng cách nhấn xác nhận, bạn đồng ý với điều khoản và điều kiện của chúng tôi.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;