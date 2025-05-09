import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { get_order_details } from '../../store/reducers/orderReducer';
import { FiArrowLeft, FiPackage, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { myOrder, loading, errorMessage } = useSelector(state => state.order);

    useEffect(() => {
        if (!orderId) {
            toast.error('Không tìm thấy mã đơn hàng');
            navigate('/dashboard/my-orders');
            return;
        }

        const fetchOrderDetails = async () => {
            try {
                console.log('Fetching order details for:', orderId);
                const response = await dispatch(get_order_details(orderId)).unwrap();
                console.log('Order details response:', response);

                if (!response || !response.order) {
                    throw new Error('Không nhận được thông tin đơn hàng');
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
                toast.error(error.message || 'Có lỗi xảy ra khi tải thông tin đơn hàng');
                navigate('/dashboard/my-orders');
            }
        };

        fetchOrderDetails();
    }, [dispatch, orderId, navigate]);

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'placed':
                return <FiClock className="w-5 h-5 text-yellow-500" />;
            case 'pending':
                return <FiPackage className="w-5 h-5 text-blue-500" />;
            case 'cancelled':
                return <FiXCircle className="w-5 h-5 text-red-500" />;
            case 'warehouse':
                return <FiCheckCircle className="w-5 h-5 text-green-500" />;
            default:
                return null;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'placed':
                return 'Đã đặt hàng';
            case 'pending':
                return 'Đang xử lý';
            case 'cancelled':
                return 'Đã hủy';
            case 'warehouse':
                return 'Đã nhập kho';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <ClipLoader color="#ef4444" size={40} />
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-red-600">{errorMessage}</h3>
                <button
                    onClick={() => navigate('/dashboard/my-orders')}
                    className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    if (!myOrder || !myOrder._id) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-600">Không tìm thấy thông tin đơn hàng</h3>
                <button
                    onClick={() => navigate('/dashboard/my-orders')}
                    className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard/my-orders')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FiArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">Chi tiết đơn hàng</h2>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusIcon(myOrder.delivery_status)}
                    <span className="text-sm font-medium text-gray-600">
                        {getStatusText(myOrder.delivery_status)}
                    </span>
                </div>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Thông tin đơn hàng</h3>
                    <div className="space-y-2">
                        <p className="text-sm">
                            <span className="text-gray-500">Mã đơn hàng:</span>{' '}
                            <span className="font-medium">#{myOrder._id.slice(-8).toUpperCase()}</span>
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-500">Ngày đặt:</span>{' '}
                            <span className="font-medium">{formatDate(myOrder.createdAt)}</span>
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-500">Trạng thái thanh toán:</span>{' '}
                            <span className={`font-medium ${
                                myOrder.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                                {myOrder.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Thông tin giao hàng</h3>
                    <div className="space-y-2">
                        <p className="text-sm">
                            <span className="text-gray-500">Người nhận:</span>{' '}
                            <span className="font-medium">{myOrder.shippingInfo?.name}</span>
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-500">Số điện thoại:</span>{' '}
                            <span className="font-medium">{myOrder.shippingInfo?.phoneNumber}</span>
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-500">Địa chỉ:</span>{' '}
                            <span className="font-medium">{myOrder.shippingInfo?.address}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Products */}
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Sản phẩm</h3>
                <div className="space-y-4">
                    {myOrder.products?.map((product, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-20 h-20 flex-shrink-0">
                                <img
                                    src={product.productId?.images?.[0] || product.images?.[0] || '/images/placeholder.png'}
                                    alt={product.productId?.name || product.name || 'Product image'}
                                    className="w-full h-full object-cover rounded-md"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/images/placeholder.png';
                                    }}
                                />
                            </div>
                            <div className="flex-grow">
                                <Link
                                    to={`/product/${product.productId?.slug || product.slug}`}
                                    className="text-sm font-medium text-gray-800 hover:text-red-500 transition-colors"
                                >
                                    {product.productId?.name || product.name}
                                </Link>
                                <p className="text-sm text-gray-500 mt-1">
                                    Số lượng: {product.quantity}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-800">
                                    {formatPrice(product.price)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {formatPrice(product.price * product.quantity)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Tổng kết đơn hàng</h3>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tạm tính:</span>
                        <span className="font-medium">{formatPrice(myOrder.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Phí vận chuyển:</span>
                        <span className="font-medium">{formatPrice(myOrder.shippingPrice || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Giảm giá:</span>
                        <span className="font-medium text-red-500">-{formatPrice(myOrder.discountPrice || 0)}</span>
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="flex justify-between text-base font-medium">
                        <span>Tổng cộng:</span>
                        <span className="text-red-500">{formatPrice(myOrder.totalPrice)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;