import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_order_details, get_order_statuses } from '../store/reducers/orderReducer';
import { reset_count, clear_cart } from '../store/reducers/cardReducer';
import { toast } from 'react-hot-toast';
import { FiCheckCircle, FiShoppingBag, FiHome, FiUser } from 'react-icons/fi';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const params = useParams(); // Để lấy orderId từ URL
    const { myOrder, loading, orderStatuses } = useSelector(state => state.order);
    const { userInfo } = useSelector(state => state.auth);
    const { deliveryStatuses = [], paymentStatuses = [] } = orderStatuses || {};
    
    // Lấy orderId từ location.state hoặc từ URL params
    const stateData = location.state || {};
    const orderIdFromParams = params.orderId;
    const orderId = stateData.orderId || orderIdFromParams;
    const { paymentMethod, paymentStatus, orderDetails } = stateData;
    
    // Ghi log thông tin nhận được để phân tích
    useEffect(() => {
        console.log('Location state:', location.state);
        console.log('URL params:', params);
        console.log('Order ID:', orderId);
        console.log('Order details from state:', orderDetails);
        console.log('My order from redux:', myOrder);
    }, [location.state, orderDetails, myOrder, params, orderId]);

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
                return 'Chờ xác nhận';
        }
    };

    const getDeliveryStatusText = (status) => {
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
                return status || 'Chờ xử lý';
        }
    };

    // Lấy thông tin sản phẩm từ localStorage - cả cartItems và recentlyViewed
    const getProductDetails = (productId) => {
        try {
            // Thử lấy từ giỏ hàng
            const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
            
            // Tìm kiếm trong tất cả các cửa hàng và sản phẩm
            for (const shop of cartItems) {
                for (const product of shop.products) {
                    if (product.productInfo && product.productInfo._id === productId) {
                        return {
                            _id: product.productInfo._id,
                            name: product.productInfo.name,
                            image: product.productInfo.images?.[0] || null,
                            price: product.productInfo.price,
                            discount: product.productInfo.discount
                        };
                    }
                }
            }
            
            // Nếu không có trong giỏ hàng, thử lấy từ recentlyViewed
            const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
            const recentProduct = recentlyViewed.find(p => p._id === productId);
            if (recentProduct) return recentProduct;
            
            // Nếu không có trong cả hai, trả về null
            return null;
        } catch (error) {
            console.error('Error getting product details from localStorage:', error);
            return null;
        }
    };

    useEffect(() => {
        if (!orderId) {
            toast.error('Không tìm thấy thông tin đơn hàng');
            navigate('/');
            return;
        }

        // Xóa giỏ hàng trên server
        if (userInfo && userInfo.id) {
            try {
                // Sử dụng async IIFE để xử lý Promise
                (async () => {
                    try {
                        await dispatch(clear_cart(userInfo.id)).unwrap();
                        console.log('Cleared cart from server for user:', userInfo.id);
                    } catch (serverError) {
                        console.error('Error clearing cart from server:', serverError);
                        // Không hiển thị lỗi này cho người dùng vì nó không ảnh hưởng đến trải nghiệm
                    }
                })();
            } catch (error) {
                console.error('Error dispatching clear_cart action:', error);
            }
        }

        // Xóa giỏ hàng trong localStorage
        try {
            dispatch(reset_count());
            localStorage.removeItem('cartItems');
            localStorage.removeItem('cartCount');
        } catch (error) {
            console.error('Error clearing local cart:', error);
        }

        // Lưu thông tin đơn hàng vào localStorage để sử dụng sau này
        if (orderDetails) {
            try {
                // Lưu thông tin đơn hàng vào orderHistory trong localStorage
                const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
                const historyItem = {
                    orderId,
                    date: new Date().toISOString(),
                    totalAmount: orderDetails.totalPrice,
                    items: orderDetails.orderItems,
                    status: 'placed'
                };
                
                // Thêm vào đầu mảng và giới hạn số lượng
                orderHistory.unshift(historyItem);
                if (orderHistory.length > 10) orderHistory.pop();
                
                localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
            } catch (error) {
                console.error('Error saving order history to localStorage:', error);
            }
        }
    }, [orderId, navigate, dispatch, orderDetails, userInfo]);

    useEffect(() => {
        if (orderId) {
            // Nếu đã có orderDetails từ state, sử dụng nó
            if (orderDetails) {
                dispatch({ type: 'order/setCurrentOrder', payload: orderDetails });
            } 
            // Nếu không có orderDetails từ state (trường hợp truy cập trực tiếp URL), lấy từ API
            else {
                dispatch(get_order_details(orderId))
                    .unwrap()
                    .then(response => {
                        console.log('API response for direct URL access:', response);
                        
                        // Nếu có response.order, lưu vào history
                        if (response.order) {
                            try {
                                const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
                                const existingOrderIndex = orderHistory.findIndex(item => item.orderId === orderId);
                                
                                // Nếu đơn hàng chưa có trong history, thêm vào
                                if (existingOrderIndex === -1) {
                                    const historyItem = {
                                        orderId,
                                        date: response.order.date || response.order.createdAt || new Date().toISOString(),
                                        totalAmount: response.order.totalPrice || 0,
                                        items: response.order.orderItems || response.order.products || [],
                                        status: response.order.delivery_status || 'placed'
                                    };
                                    
                                    orderHistory.unshift(historyItem);
                                    if (orderHistory.length > 10) orderHistory.pop();
                                    
                                    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
                                }
                            } catch (error) {
                                console.error('Error saving order to history:', error);
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching order details:', error);
                        toast.error('Không thể tải thông tin đơn hàng');
                    });
            }
        }
    }, [orderId, dispatch, orderDetails]);

    // Tải chi tiết sản phẩm cho tất cả các sản phẩm trong đơn hàng
    useEffect(() => {
        const order = orderDetails || myOrder;
        if (!order) return;

        const orderItems = order.orderItems || order.products;
        if (!orderItems || !orderItems.length) return;

        // Thu thập thông tin sản phẩm từ localStorage
        const images = {};
        const names = {};

        orderItems.forEach(item => {
            let productId = '';
            if (typeof item.productId === 'string') {
                productId = item.productId;
            } else if (item.productId && item.productId._id) {
                productId = item.productId._id;
            }

            if (productId) {
                const productDetail = getProductDetails(productId);
                if (productDetail) {
                    if (productDetail.image) {
                        images[productId] = productDetail.image;
                    }
                    if (productDetail.name) {
                        names[productId] = productDetail.name;
                    }
                }
            }
        });

        // Cập nhật state.myOrder hoặc state.currentOrder nếu cần thiết
        if (order.orderItems && order.orderItems.length > 0) {
            const updatedItems = order.orderItems.map(item => {
                const productId = typeof item.productId === 'string' ? item.productId : item.productId?._id;
                if (!productId) return item;

                // Update item with cached data if available
                return {
                    ...item,
                    name: names[productId] || item.name,
                    image: images[productId] || item.image
                };
            });

            // Nếu có thông tin cập nhật và orderDetails là từ state
            if (Object.keys(names).length > 0 && orderDetails) {
                const updatedOrderDetails = {
                    ...orderDetails,
                    orderItems: updatedItems
                };
                dispatch({ type: 'order/setCurrentOrder', payload: updatedOrderDetails });
            }
        }
    }, [orderDetails, myOrder, dispatch]);

    // After the useEffect where you fetch order details:
    useEffect(() => {
        // Fetch the order status list for displaying status names
        dispatch(get_order_statuses());
    }, [dispatch]);

    if (loading && !orderDetails) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    // Get the final order data from either orderDetails or myOrder
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

    // Kiểm tra và chuẩn hóa dữ liệu đơn hàng
    const shippingInfo = order.shippingInfo || order.shippingAddress;
    const orderItems = order.orderItems || order.products || [];

    if (!shippingInfo || !orderItems || orderItems.length === 0) {
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
                                {order.payment_method === 'cod' || paymentMethod === 'cod' 
                                    ? 'Thanh toán khi nhận hàng (COD)' 
                                    : 'Thanh toán qua thẻ'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600">Trạng thái thanh toán:</p>
                            <p className="font-medium">
                                {getPaymentStatusText(order.payment_status || paymentStatus)}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600">Trạng thái đơn hàng:</p>
                            <p className="font-medium">
                                {getDeliveryStatusText(order.delivery_status || 'pending')}
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

                            // Lấy thông tin sản phẩm từ các cấu trúc dữ liệu khác nhau
                            let productInfo = {
                                name: `Sản phẩm #${index + 1}`,
                                image: '/images/default-product.png',
                                quantity: product.quantity || 1
                            };

                            // Trường hợp 1: productId là đối tượng
                            if (product.productId && typeof product.productId === 'object') {
                                productInfo.name = product.productId.name || productInfo.name;
                                productInfo.image = product.productId.images?.[0] || productInfo.image;
                            } 
                            // Trường hợp 2: product có trường name và image (từ OrderConfirmation state)
                            else if (product.name || product.image) {
                                productInfo.name = product.name || productInfo.name;
                                productInfo.image = product.image || productInfo.image;
                            }
                            // Trường hợp 3: product chính là thông tin sản phẩm (từ API get_order_details)
                            else if (product.name) {
                                productInfo.name = product.name;
                                productInfo.image = product.images?.[0] || productInfo.image;
                            }

                            return (
                                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                        <img
                                            src={productInfo.image}
                                            alt={productInfo.name}
                                            className="w-full h-full object-contain rounded-md bg-white"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/images/default-product.png';
                                            }}
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium text-gray-800 hover:text-red-500 transition-colors">
                                            {productInfo.name}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Số lượng: {productInfo.quantity}
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