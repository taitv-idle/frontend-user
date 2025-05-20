import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { get_order_details, get_order_statuses } from '../../store/reducers/orderReducer';
import { FiArrowLeft, FiPackage, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { myOrder, loading, errorMessage, orderStatuses } = useSelector(state => state.order);
    const { deliveryStatuses = [], paymentStatuses = [] } = orderStatuses || {};

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
                
                // Fetch order statuses if they haven't been loaded yet
                if ((!deliveryStatuses || deliveryStatuses.length === 0) && 
                    (!paymentStatuses || paymentStatuses.length === 0)) {
                    dispatch(get_order_statuses());
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
                toast.error(error.message || 'Có lỗi xảy ra khi tải thông tin đơn hàng');
                navigate('/dashboard/my-orders');
            }
        };

        fetchOrderDetails();
    }, [dispatch, orderId, navigate, deliveryStatuses, paymentStatuses]);

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

    // Tính toán tổng tiền sản phẩm
    const totalItemsPrice = myOrder.products?.reduce((total, product) => {
        const productPrice = Number(product.price || 0);
        const productDiscount = Number(product.discount || 0);
        const discountedPrice = calculateDiscountedPrice(productPrice, productDiscount);
        return total + (discountedPrice * (product.quantity || 0));
    }, 0) || 0;

    const shippingPrice = calculateShippingFee(totalItemsPrice);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <FiClock className="w-5 h-5 text-yellow-500" />;
            case 'processing':
                return <FiPackage className="w-5 h-5 text-blue-500" />;
            case 'shipped':
                return <FiPackage className="w-5 h-5 text-indigo-500" />;
            case 'delivered':
                return <FiCheckCircle className="w-5 h-5 text-green-500" />;
            case 'completed':
                return <FiCheckCircle className="w-5 h-5 text-green-600" />;
            case 'cancelled':
                return <FiXCircle className="w-5 h-5 text-red-500" />;
            case 'returned':
                return <FiXCircle className="w-5 h-5 text-orange-500" />;
            default:
                return <FiClock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusText = (status) => {
        // Try to find status display name from API data first
        if (deliveryStatuses && deliveryStatuses.length > 0) {
            const foundStatus = deliveryStatuses.find(s => s.value === status);
            if (foundStatus) return foundStatus.displayName;
        }
        
        // Fallback to hardcoded values
        switch (status) {
            case 'pending':
                return 'Chờ xử lý';
            case 'processing':
                return 'Đang xử lý';
            case 'shipped':
                return 'Đang giao hàng';
            case 'delivered':
                return 'Đã giao hàng';
            case 'completed':
                return 'Hoàn thành';
            case 'cancelled':
                return 'Đã hủy';
            case 'returned':
                return 'Đã hoàn trả';
            default:
                return status || 'Không xác định';
        }
    };

    const getPaymentStatusText = (status) => {
        // Try to find status display name from API data first
        if (paymentStatuses && paymentStatuses.length > 0) {
            const foundStatus = paymentStatuses.find(s => s.value === status);
            if (foundStatus) return foundStatus.displayName;
        }
        
        // Fallback to hardcoded values
        switch (status) {
            case 'paid':
                return 'Đã thanh toán';
            case 'pending':
                return 'Chờ thanh toán';
            case 'unpaid':
                return 'Chưa thanh toán';
            case 'refunded':
                return 'Đã hoàn tiền';
            case 'failed':
                return 'Thanh toán thất bại';
            default:
                return 'Chờ thanh toán';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'text-green-600';
            case 'pending':
                return 'text-yellow-600';
            case 'unpaid':
                return 'text-red-600';
            case 'refunded':
                return 'text-blue-600';
            case 'failed':
                return 'text-red-600';
            default:
                return 'text-yellow-600';
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
                            <span className="font-medium">#{myOrder._id?.slice(-8).toUpperCase() || 'N/A'}</span>
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-500">Ngày đặt:</span>{' '}
                            <span className="font-medium">{formatDate(myOrder.date || myOrder.createdAt)}</span>
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-500">Phương thức thanh toán:</span>{' '}
                            <span className="font-medium">
                                {myOrder.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Thanh toán online'}
                            </span>
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-500">Trạng thái thanh toán:</span>{' '}
                            <span className={`font-medium ${getPaymentStatusColor(myOrder.payment_status)}`}>
                                {getPaymentStatusText(myOrder.payment_status)}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Thông tin giao hàng</h3>
                    <div className="space-y-2">
                        <p className="text-sm">
                            <span className="text-gray-500">Người nhận:</span>{' '}
                            <span className="font-medium">{myOrder.shippingAddress?.name || 'N/A'}</span>
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-500">Số điện thoại:</span>{' '}
                            <span className="font-medium">{myOrder.shippingAddress?.phone || 'N/A'}</span>
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-500">Địa chỉ:</span>{' '}
                            <span className="font-medium">
                                {myOrder.shippingAddress?.address 
                                    ? `${myOrder.shippingAddress.address}${myOrder.shippingAddress.area ? `, ${myOrder.shippingAddress.area}` : ''}${myOrder.shippingAddress.city ? `, ${myOrder.shippingAddress.city}` : ''}${myOrder.shippingAddress.province ? `, ${myOrder.shippingAddress.province}` : ''}`
                                    : 'N/A'
                                }
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Products */}
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Sản phẩm</h3>
                <div className="space-y-4">
                    {myOrder.products?.map((product, index) => {
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
                                    <Link
                                        to={`/product/details/${product.productId?.slug}`}
                                        className="text-sm font-medium text-gray-800 hover:text-red-500 transition-colors"
                                    >
                                        {product.productId?.name}
                                    </Link>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Số lượng: {product.quantity || 0}
                                    </p>
                                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                                        {product.color && (
                                            <span className="px-2 py-1 bg-gray-100 rounded-md">
                                                Màu: <span className="font-medium">{product.color}</span>
                                            </span>
                                        )}
                                        {product.size && (
                                            <span className="px-2 py-1 bg-gray-100 rounded-md">
                                                Size: <span className="font-medium">{product.size}</span>
                                            </span>
                                        )}
                                    </div>
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

            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Tổng kết đơn hàng</h3>
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
            </div>
        </div>
    );
};

export default OrderDetails;