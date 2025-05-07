import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { get_order_details } from '../../store/reducers/orderReducer';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';

const OrderDetails = () => {
    const { orderId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    const { userInfo } = useSelector(state => state.auth);
    const { myOrder } = useSelector(state => state.order);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setIsLoading(true);
                await dispatch(get_order_details(orderId));
            } catch (error) {
                toast.error('Có lỗi xảy ra khi tải thông tin đơn hàng');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId, dispatch]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'placed':
                return <FiCheckCircle className="text-blue-500" />;
            case 'pending':
                return <FiClock className="text-yellow-500" />;
            case 'cancelled':
                return <FiXCircle className="text-red-500" />;
            case 'warehouse':
                return <FiPackage className="text-purple-500" />;
            case 'delivered':
                return <FiTruck className="text-green-500" />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <ClipLoader color="#ef4444" size={40} />
            </div>
        );
    }

    if (!myOrder) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-600">Không tìm thấy thông tin đơn hàng</h3>
                <button
                    onClick={() => navigate('/dashboard/my-orders')}
                    className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    Quay lại danh sách đơn hàng
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/dashboard/my-orders')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FiArrowLeft className="text-gray-600" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng</h2>
                            <p className="text-sm text-gray-500">#{myOrder._id}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Ngày đặt: {formatDate(myOrder.createdAt)}</p>
                        <p className="text-lg font-semibold text-red-500 mt-1">{formatPrice(myOrder.price)}</p>
                    </div>
                </div>
            </div>

            {/* Order Status */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {getStatusIcon(myOrder.delivery_status)}
                        <div>
                            <h3 className="font-medium text-gray-800">Trạng thái đơn hàng</h3>
                            <p className="text-sm text-gray-500 capitalize">{myOrder.delivery_status}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <FiPackage className="text-gray-500" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-800">Thanh toán</h3>
                            <p className="text-sm text-gray-500">
                                {myOrder.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shipping Information */}
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin giao hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">Địa chỉ giao hàng</h4>
                        <p className="text-gray-600">{myOrder.shippingInfo?.address}</p>
                        <p className="text-gray-600">{myOrder.shippingInfo?.city}, {myOrder.shippingInfo?.province}</p>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">Thông tin người nhận</h4>
                        <p className="text-gray-600">{myOrder.shippingInfo?.name}</p>
                        <p className="text-gray-600">{userInfo.email}</p>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sản phẩm đã đặt</h3>
                <div className="space-y-4">
                    {myOrder.products?.map((product, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                                <Link
                                    to={`/product/details/${product.slug}`}
                                    className="font-medium text-gray-800 hover:text-red-500 transition-colors"
                                >
                                    {product.name}
                                </Link>
                                <p className="text-sm text-gray-500">Số lượng: {product.quantity}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-red-500 font-medium">
                                        {formatPrice(product.price - Math.floor((product.price * product.discount) / 100))}
                                    </span>
                                    {product.discount > 0 && (
                                        <>
                                            <span className="text-gray-400 line-through">
                                                {formatPrice(product.price)}
                                            </span>
                                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                                -{product.discount}%
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3">Tổng kết đơn hàng</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Tạm tính</span>
                            <span>{formatPrice(myOrder.price)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Phí vận chuyển</span>
                            <span>Miễn phí</span>
                        </div>
                        <div className="border-t border-gray-200 my-2"></div>
                        <div className="flex justify-between font-medium text-gray-800">
                            <span>Tổng cộng</span>
                            <span className="text-red-500">{formatPrice(myOrder.price)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;