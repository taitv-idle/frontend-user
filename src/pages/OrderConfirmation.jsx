import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_order_details } from '../store/reducers/orderReducer';
import { reset_count } from '../store/reducers/cardReducer';
import { toast } from 'react-hot-toast';
import { FiCheckCircle, FiShoppingBag, FiHome, FiUser } from 'react-icons/fi';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { myOrder, loading } = useSelector(state => state.order);
    const { orderId, paymentMethod, paymentStatus, orderDetails } = location.state || {};

    const formatPrice = (price) => {
        if (!price) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const calculateDiscountedPrice = (price, discount) => {
        if (!price) return 0;
        if (!discount || discount === 0) return price;
        return Math.floor(price - (price * discount) / 100);
    };

    const calculateShippingFee = (totalPrice) => {
        if (!totalPrice) return 0;
        return totalPrice >= 500000 ? 0 : 40000;
    };

    useEffect(() => {
        if (!orderId) {
            toast.error('Không tìm thấy thông tin đơn hàng');
            navigate('/');
            return;
        }

        try {
            dispatch(reset_count());
            localStorage.removeItem('cartItems');
            localStorage.removeItem('cartCount');
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    }, [orderId, navigate, dispatch]);

    useEffect(() => {
        if (orderId) {
            if (orderDetails) {
                dispatch({ type: 'order/setCurrentOrder', payload: orderDetails });
            } else {
                dispatch(get_order_details(orderId))
                    .unwrap()
                    .catch(error => {
                        console.error('Error fetching order details:', error);
                        toast.error('Không thể tải thông tin đơn hàng');
                    });
            }
        }
    }, [orderId, dispatch, orderDetails]);

    if (loading && !orderDetails) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    const order = orderDetails || myOrder;

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Không tìm thấy thông tin đơn hàng</h2>
                <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                    Về trang chủ
                </button>
            </div>
        );
    }

    const shippingInfo = order.shippingInfo || order.shippingAddress;
    const orderItems = order.orderItems || order.products;

    if (!shippingInfo || !orderItems) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Thông tin đơn hàng không hợp lệ</h2>
                    <p className="text-gray-600 mb-6">
                        Vui lòng kiểm tra lại thông tin đơn hàng hoặc liên hệ với chúng tôi để được hỗ trợ.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                            Về trang chủ
                        </button>
                        <button
                            onClick={() => navigate('/contact')}
                            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            Liên hệ hỗ trợ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const totalItemsPrice = orderItems.reduce((total, product) => {
        const productPrice = Number(product.price || 0);
        const productDiscount = Number(product.discount || 0);
        const discountedPrice = calculateDiscountedPrice(productPrice, productDiscount);
        return total + (discountedPrice * (product.quantity || 0));
    }, 0);

    const shippingPrice = calculateShippingFee(totalItemsPrice);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-8">
                    <div className="text-green-500 mb-4">
                        <FiCheckCircle className="w-16 h-16 mx-auto" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Đặt hàng thành công!
                    </h1>
                    <p className="text-gray-600">
                        Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là: #{orderId?.slice(-8).toUpperCase()}
                    </p>
                </div>

                <div className="border-t border-b border-gray-200 py-4 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600">Phương thức thanh toán:</p>
                            <p className="font-medium">
                                {paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Thanh toán qua thẻ'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600">Trạng thái thanh toán:</p>
                            <p className="font-medium">
                                {paymentStatus === 'pending' ? 'Chờ xác nhận' : 'Đã thanh toán'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <div className="flex items-start gap-3">
                            <FiUser className="w-5 h-5 text-gray-500 mt-1" />
                            <div>
                                <p className="font-medium">{shippingInfo.name || 'N/A'}</p>
                                <p className="text-gray-600">{shippingInfo.phone || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 mt-3">
                            <FiHome className="w-5 h-5 text-gray-500 mt-1" />
                            <p className="text-gray-600">
                                {[
                                    shippingInfo.address,
                                    shippingInfo.area,
                                    shippingInfo.city,
                                    shippingInfo.province
                                ].filter(Boolean).join(', ') || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Chi tiết đơn hàng</h2>
                    <div className="space-y-4">
                        {orderItems.map((product, index) => {
                            const productPrice = Number(product.price || 0);
                            const productDiscount = Number(product.discount || 0);
                            const discountedPrice = calculateDiscountedPrice(productPrice, productDiscount);
                            const totalPrice = discountedPrice * (product.quantity || 0);

                            return (
                                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-20 h-20 flex-shrink-0">
                                        <img
                                            src={product.productId?.images?.[0] || '/images/placeholder.png'}
                                            alt={product.productId?.name || 'Product image'}
                                            className="w-full h-full object-contain rounded-md bg-white"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/images/placeholder.png';
                                            }}
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium text-gray-800 hover:text-red-500 transition-colors">
                                            {product.productId?.name}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Số lượng: {product.quantity || 0}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-medium text-red-500">
                                                {formatPrice(discountedPrice)}
                                            </span>
                                            {productDiscount > 0 && (
                                                <span className="text-xs text-gray-500 line-through">
                                                    {formatPrice(productPrice)}
                                                </span>
                                            )}
                                            <span className="text-sm font-medium text-gray-800 mt-1">
                                                {formatPrice(totalPrice)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <p className="text-gray-600">Tạm tính:</p>
                            <p className="font-medium">{formatPrice(totalItemsPrice)}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-gray-600">Phí vận chuyển:</p>
                            <p className="font-medium">
                                {shippingPrice === 0 ? (
                                    <span className="text-green-600">Miễn phí</span>
                                ) : (
                                    formatPrice(shippingPrice)
                                )}
                            </p>
                        </div>
                        <div className="border-t border-gray-200 my-2"></div>
                        <div className="flex justify-between text-base font-medium">
                            <span>Tổng cộng:</span>
                            <span className="text-red-500">
                                {formatPrice(totalItemsPrice + shippingPrice)}
                            </span>
                        </div>
                        {totalItemsPrice < 500000 && (
                            <p className="text-xs text-gray-500 mt-2">
                                * Đơn hàng trên 500.000đ sẽ được miễn phí vận chuyển
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center space-y-3">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center justify-center gap-2"
                    >
                        <FiShoppingBag className="w-5 h-5" />
                        Tiếp tục mua sắm
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/my-orders')}
                        className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                        Xem đơn hàng của tôi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation; 