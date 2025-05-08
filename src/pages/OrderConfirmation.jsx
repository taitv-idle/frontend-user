import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_order_details } from '../store/reducers/orderReducer';
import { reset_count } from '../store/reducers/cardReducer';
import { toast } from 'react-hot-toast';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { myOrder, loading } = useSelector(state => state.order);
    const { orderId, paymentMethod, paymentStatus, orderDetails } = location.state || {};

    console.log('Location state:', location.state);
    console.log('MyOrder from Redux:', myOrder);
    console.log('OrderDetails from state:', orderDetails);

    // Kiểm tra và chuyển hướng nếu không có orderId
    useEffect(() => {
        if (!orderId) {
            console.log('No orderId found in state');
            toast.error('Không tìm thấy thông tin đơn hàng');
            navigate('/');
            return;
        }

        // Xóa giỏ hàng sau khi đặt hàng thành công
        dispatch(reset_count());
    }, [orderId, navigate, dispatch]);

    // Fetch thông tin đơn hàng
    useEffect(() => {
        if (orderId) {
            if (orderDetails) {
                console.log('Using orderDetails from state');
                // Nếu có orderDetails từ state, sử dụng nó
                dispatch({ type: 'order/setCurrentOrder', payload: orderDetails });
            } else {
                console.log('Fetching order details from API');
                // Nếu không có, fetch từ API
                dispatch(get_order_details(orderId));
            }
        }
    }, [orderId, dispatch, orderDetails]);

    // Nếu đang loading và không có orderDetails, hiển thị loading spinner
    if (loading && !orderDetails) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Nếu không có thông tin đơn hàng, hiển thị thông báo
    if (!myOrder && !orderDetails) {
        console.log('No order data available');
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Không tìm thấy thông tin đơn hàng</h2>
                <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Về trang chủ
                </button>
            </div>
        );
    }

    const order = myOrder || orderDetails;
    console.log('Final order data:', order);

    // Kiểm tra nếu không có thông tin đơn hàng đầy đủ
    if (!order || !order.shippingInfo || !order.orderItems) {
        console.log('Invalid order data:', {
            order,
            hasShippingInfo: !!order?.shippingInfo,
            hasOrderItems: !!order?.orderItems,
            shippingInfo: order?.shippingInfo,
            orderItems: order?.orderItems
        });
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
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-8">
                    <div className="text-green-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Đặt hàng thành công!
                    </h1>
                    <p className="text-gray-600">
                        Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là: #{orderId}
                    </p>
                </div>

                <div className="border-t border-b border-gray-200 py-4 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
                    <div className="grid grid-cols-2 gap-4">
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
                        <p className="font-medium">{order.shippingInfo?.name || 'N/A'}</p>
                        <p className="text-gray-600">{order.shippingInfo?.phone || 'N/A'}</p>
                        <p className="text-gray-600">
                            {[
                                order.shippingInfo?.address,
                                order.shippingInfo?.area,
                                order.shippingInfo?.city,
                                order.shippingInfo?.province
                            ].filter(Boolean).join(', ') || 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Chi tiết đơn hàng</h2>
                    <div className="space-y-4">
                        {order.orderItems?.map((item, index) => (
                            <div key={index} className="flex items-center justify-between border-b pb-4">
                                <div className="flex items-center">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded-md"
                                    />
                                    <div className="ml-4">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-gray-600">Số lượng: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-medium">
                                    {((item.price || 0) * (item.quantity || 0)).toLocaleString('vi-VN')}₫
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <p className="text-gray-600">Tạm tính:</p>
                            <p className="font-medium">{(order.itemsPrice || 0).toLocaleString('vi-VN')}₫</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-gray-600">Phí vận chuyển:</p>
                            <p className="font-medium">{(order.shippingPrice || 0).toLocaleString('vi-VN')}₫</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-gray-600">Thuế:</p>
                            <p className="font-medium">{(order.taxPrice || 0).toLocaleString('vi-VN')}₫</p>
                        </div>
                        <div className="flex justify-between text-lg font-semibold">
                            <p>Tổng cộng:</p>
                            <p className="text-blue-600">{(order.totalPrice || 0).toLocaleString('vi-VN')}₫</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center space-y-3">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Tiếp tục mua sắm
                    </button>
                    <button
                        onClick={() => navigate('/orders')}
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