import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { get_order_details, get_order_statuses } from '../../store/reducers/orderReducer';
import { FiArrowLeft, FiPackage, FiCheckCircle, FiXCircle, FiClock, FiShoppingBag, FiTruck } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { myOrder, loading, errorMessage, orderStatuses } = useSelector(state => state.order);
    const { deliveryStatuses = [], paymentStatuses = [] } = orderStatuses || {};
    
    // Add state for tracking modal
    const [trackingModalOpen, setTrackingModalOpen] = useState(false);
    const [trackingProduct, setTrackingProduct] = useState(null);
    const [trackingStatus, setTrackingStatus] = useState(null);
    const [trackingSellerName, setTrackingSellerName] = useState(null);

    // Open tracking modal for a product
    const openProductTracking = (product, status, sellerName) => {
        setTrackingProduct(product);
        setTrackingStatus(status);
        setTrackingSellerName(sellerName);
        setTrackingModalOpen(true);
    };

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

    // eslint-disable-next-line no-unused-vars
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

    // Comment out or remove this unused variable declaration
    // const shippingPrice = calculateShippingFee(totalItemsPrice);

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

    // Add a function to get a more detailed tracking status description
    const getStatusDescription = (status) => {
        switch (status) {
            case 'pending':
                return 'Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý.';
            case 'processing':
                return 'Đơn hàng của bạn đang được chuẩn bị.';
            case 'shipped':
                return 'Đơn hàng của bạn đã được giao cho đơn vị vận chuyển.';
            case 'delivered':
                return 'Đơn hàng của bạn đã được giao thành công.';
            case 'completed':
                return 'Đơn hàng của bạn đã hoàn thành.';
            case 'cancelled':
                return 'Đơn hàng của bạn đã bị hủy.';
            case 'returned':
                return 'Đơn hàng của bạn đã được hoàn trả.';
            default:
                return 'Trạng thái đơn hàng không xác định.';
        }
    };

    // Add function to render timeline step markers
    // eslint-disable-next-line no-unused-vars
    const renderStatusTimeline = (currentStatus) => {
        const statuses = [
            { id: 'pending', label: 'Chờ xử lý', icon: <FiClock /> },
            { id: 'processing', label: 'Đang xử lý', icon: <FiPackage /> },
            { id: 'shipped', label: 'Đang giao hàng', icon: <FiTruck /> },
            { id: 'delivered', label: 'Đã giao hàng', icon: <FiCheckCircle /> },
            { id: 'completed', label: 'Hoàn thành', icon: <FiCheckCircle /> }
        ];

        // Special cases where normal timeline doesn't apply
        if (currentStatus === 'cancelled') {
            return (
                <div className="flex items-center mt-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                        <FiXCircle className="w-5 h-5" />
                    </div>
                    <div className="ml-3">
                        <p className="font-medium text-red-500">Đã hủy</p>
                        <p className="text-sm text-gray-500 mt-1">Đơn hàng đã bị hủy</p>
                    </div>
                </div>
            );
        }

        if (currentStatus === 'returned') {
            return (
                <div className="flex items-center mt-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                        <FiXCircle className="w-5 h-5" />
                    </div>
                    <div className="ml-3">
                        <p className="font-medium text-orange-500">Đã hoàn trả</p>
                        <p className="text-sm text-gray-500 mt-1">Đơn hàng đã được hoàn trả</p>
                    </div>
                </div>
            );
        }

        // Normal status timeline
        const currentIndex = statuses.findIndex(status => status.id === currentStatus);
        const activeIndex = currentIndex === -1 ? 0 : currentIndex;

        return (
            <div className="mt-4">
                <div className="relative">
                    <div className="absolute left-8 top-0 h-full w-0.5 bg-gray-200"></div>
                    <div className="space-y-8">
                        {statuses.map((status, index) => {
                            const isActive = index <= activeIndex;
                            const isPending = index === activeIndex;
                            
                            return (
                                <div key={status.id} className="relative flex items-center">
                                    <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 
                                        `${isPending ? 'bg-blue-100 text-blue-500 animate-pulse' : 'bg-green-100 text-green-500'}` : 
                                        'bg-gray-100 text-gray-400'}`}>
                                        {status.icon}
                                    </div>
                                    <div className="ml-4">
                                        <p className={`font-medium ${isActive ? 
                                            `${isPending ? 'text-blue-600' : 'text-green-600'}` : 
                                            'text-gray-500'}`}>
                                            {status.label}
                                        </p>
                                        {isPending && (
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {getStatusDescription(status.id)}
                                            </p>
                                        )}
                                        {index === 0 && isActive && !isPending && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {formatDate(myOrder.createdAt || myOrder.date)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
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

    // Kiểm tra xem có đơn hàng con (suborder) không
    const hasSubOrders = myOrder.suborder && myOrder.suborder.length > 0;

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

            {/* Main Order Summary for All Products */}
            {!hasSubOrders && (
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
                                        <div className="flex justify-between items-start">
                                            <Link
                                                to={`/product/details/${product.productId?.slug || product.productId?._id}`}
                                                className="text-sm font-medium text-gray-800 hover:text-red-500 transition-colors"
                                            >
                                                {product.productId?.name}
                                            </Link>
                                            <button
                                                onClick={() => openProductTracking(product, myOrder.delivery_status)}
                                                className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                                            >
                                                Theo dõi
                                            </button>
                                        </div>
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
            )}

            {/* Sub Orders (By Seller) */}
            {hasSubOrders && (
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Đơn hàng từ các cửa hàng</h3>
                    <div className="space-y-6">
                        {myOrder.suborder.map((sellerOrder, sellerIndex) => (
                            <div key={sellerIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Seller Information */}
                                <div className="bg-gray-100 p-4 flex items-center gap-3">
                                    <FiShoppingBag className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <h4 className="font-medium text-gray-800">
                                            {sellerOrder.shopName || `Cửa hàng #${sellerIndex + 1}`}
                                        </h4>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="flex items-center text-xs px-2 py-1 bg-gray-50 rounded-full">
                                                {getStatusIcon(sellerOrder.delivery_status)}
                                                <span>{getStatusText(sellerOrder.delivery_status)}</span>
                                            </span>
                                            <span className={`text-xs px-2 py-1 bg-gray-50 rounded-full ${getPaymentStatusColor(sellerOrder.payment_status)}`}>
                                                {getPaymentStatusText(sellerOrder.payment_status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Seller Products */}
                                <div className="p-4">
                                    <div className="space-y-4">
                                        {sellerOrder.products?.map((product, index) => {
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
                                                        <div className="flex justify-between items-start">
                                                            <Link
                                                                to={`/product/details/${product.productId?.slug || product.productId?._id}`}
                                                                className="text-sm font-medium text-gray-800 hover:text-red-500 transition-colors"
                                                            >
                                                                {product.productId?.name}
                                                            </Link>
                                                            <button
                                                                onClick={() => openProductTracking(
                                                                    product, 
                                                                    sellerOrder.delivery_status,
                                                                    sellerOrder.shopName || `Cửa hàng #${sellerIndex + 1}`
                                                                )}
                                                                className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                                                            >
                                                                Theo dõi
                                                            </button>
                                                        </div>
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

                                    {/* Seller Order Summary */}
                                    <div className="mt-4 border-t border-gray-200 pt-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Tổng đơn hàng:</span>
                                            <span className="font-medium">{formatPrice(sellerOrder.price || 0)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mt-2">
                                            <span className="text-gray-600">Phí vận chuyển:</span>
                                            <span className="font-medium">
                                                {sellerOrder.shipping_fee === 0 ? (
                                                    <span className="text-green-600">Miễn phí</span>
                                                ) : (
                                                    formatPrice(sellerOrder.shipping_fee || 40000)
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                            <p className="text-gray-600">
                                Phí vận chuyển:
                                {hasSubOrders && (
                                    <span className="text-xs text-gray-500 ml-1">
                                        ({myOrder.suborder.length} cửa hàng x 40.000₫)
                                    </span>
                                )}
                            </p>
                            <p className="font-medium">
                                {myOrder.shipping_fee === 0 ? (
                                    <span className="text-green-600">Miễn phí</span>
                                ) : (
                                    formatPrice(myOrder.shipping_fee || calculateSellerShippingFee(myOrder))
                                )}
                            </p>
                        </div>
                        <div className="border-t border-gray-200 my-2"></div>
                        <div className="flex justify-between text-base font-medium">
                            <span>Tổng cộng:</span>
                            <span className="text-red-500">
                                {formatPrice(myOrder.price || (totalItemsPrice + (myOrder.shipping_fee || calculateSellerShippingFee(myOrder))))}
                            </span>
                        </div>
                        {totalItemsPrice < 500000 && (
                            <p className="text-xs text-gray-500 mt-2">
                                * Phí vận chuyển: 40.000₫/cửa hàng. Đơn hàng trên 500.000đ sẽ được miễn phí vận chuyển.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Tracking Modal */}
            <TrackingModal
                isOpen={trackingModalOpen}
                onClose={() => setTrackingModalOpen(false)}
                product={trackingProduct}
                sellerName={trackingSellerName}
                status={trackingStatus}
                statusDescription={trackingStatus ? getStatusDescription(trackingStatus) : ''}
                getStatusIcon={getStatusIcon}
                getStatusText={getStatusText}
                getStatusDescription={getStatusDescription}
            />
        </div>
    );
};

// Define TrackingModal component after OrderDetails
const TrackingModal = ({ 
    isOpen, 
    onClose, 
    product, 
    sellerName, 
    status, 
    statusDescription,
    getStatusIcon,
    getStatusText,
    getStatusDescription
}) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Theo dõi sản phẩm</h3>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div className="p-4">
                    <div className="flex items-center mb-4">
                        <div className="w-16 h-16 flex-shrink-0 mr-4">
                            <img
                                src={product?.productId?.images?.[0] || '/images/placeholder.png'}
                                alt={product?.productId?.name || 'Product image'}
                                className="w-full h-full object-contain rounded-md bg-gray-100"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/placeholder.png';
                                }}
                            />
                        </div>
                        <div>
                            <h4 className="font-medium">{product?.productId?.name}</h4>
                            <p className="text-sm text-gray-500">Số lượng: {product?.quantity}</p>
                            {sellerName && (
                                <p className="text-sm text-gray-500">
                                    Cửa hàng: {sellerName}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="border-t border-b border-gray-200 py-4 my-4">
                        <div className="flex items-center mb-2">
                            <span className="flex items-center text-sm px-2 py-1 bg-gray-100 rounded-full">
                                {status && getStatusIcon(status)}
                                <span className="ml-1">{status && getStatusText(status)}</span>
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {statusDescription || (status && getStatusDescription(status))}
                        </p>
                    </div>
                    
                    <div className="mt-4">
                        <div className="relative">
                            <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200"></div>
                            <div className="space-y-6">
                                {[
                                    { id: 'pending', label: 'Chờ xử lý', icon: <FiClock className="w-4 h-4" /> },
                                    { id: 'processing', label: 'Đang xử lý', icon: <FiPackage className="w-4 h-4" /> },
                                    { id: 'shipped', label: 'Đang giao hàng', icon: <FiTruck className="w-4 h-4" /> },
                                    { id: 'delivered', label: 'Đã giao hàng', icon: <FiCheckCircle className="w-4 h-4" /> },
                                    { id: 'completed', label: 'Hoàn thành', icon: <FiCheckCircle className="w-4 h-4" /> }
                                ].map((step, index) => {
                                    const isActive = status && (['cancelled', 'returned'].includes(status) 
                                        ? index === 0
                                        : step.id === status || 
                                          (index < ['pending', 'processing', 'shipped', 'delivered', 'completed'].indexOf(status)));
                                    const isCurrent = status && step.id === status;
                                    
                                    return (
                                        <div key={step.id} className="relative flex items-center">
                                            <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                                                isActive 
                                                    ? isCurrent 
                                                        ? 'bg-blue-100 text-blue-500 animate-pulse'
                                                        : 'bg-green-100 text-green-500' 
                                                    : 'bg-gray-100 text-gray-400'
                                            }`}>
                                                {step.icon}
                                            </div>
                                            <div className="ml-3">
                                                <p className={`text-sm font-medium ${
                                                    isActive 
                                                        ? isCurrent 
                                                            ? 'text-blue-600'
                                                            : 'text-green-600' 
                                                        : 'text-gray-500'
                                                }`}>
                                                    {step.label}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                {status && ['cancelled', 'returned'].includes(status) && (
                                    <div className="relative flex items-center">
                                        <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                                            status === 'cancelled' ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-500'
                                        }`}>
                                            <FiXCircle className="w-4 h-4" />
                                        </div>
                                        <div className="ml-3">
                                            <p className={`text-sm font-medium ${
                                                status === 'cancelled' ? 'text-red-600' : 'text-orange-600'
                                            }`}>
                                                {getStatusText(status)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

// Calculate shipping fee based on unique sellers
const calculateSellerShippingFee = (order) => {
    // Default shipping fee is 40000 per seller
    const DEFAULT_FEE = 40000;
    
    // If total is over 500000, shipping is free
    if (!order || !order.products || order.products.length === 0) {
        return DEFAULT_FEE;
    }
    
    const totalPrice = order.products.reduce((sum, product) => {
        return sum + (product.price * product.quantity);
    }, 0);
    
    if (totalPrice >= 500000) {
        return 0;
    }
    
    // If there are suborders, count unique sellers
    if (order.suborder && Array.isArray(order.suborder) && order.suborder.length > 0) {
        return order.suborder.length * DEFAULT_FEE;
    }
    
    // Default case: just one seller
    return DEFAULT_FEE;
};

export default OrderDetails;