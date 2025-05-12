import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { get_orders } from '../../store/reducers/orderReducer';
import { FiChevronRight, FiClock, FiCheckCircle, FiXCircle, FiPackage, FiSearch, FiFilter } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';

const Orders = () => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const { myOrders, loading, errorMessage } = useSelector(state => state.order);

    const fetchOrders = useCallback(async () => {
        if (!userInfo || !userInfo.id) {
            console.log('No user info available:', userInfo);
            toast.error('Vui lòng đăng nhập để xem đơn hàng');
            return;
        }

        try {
            console.log('Fetching orders for user:', {
                userId: userInfo.id,
                status: statusFilter
            });

            const response = await dispatch(get_orders({ 
                status: statusFilter, 
                customerId: userInfo.id 
            })).unwrap();

            console.log('Orders response:', response);
            
            if (!response || !response.orders) {
                throw new Error('Không nhận được dữ liệu đơn hàng');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi tải đơn hàng');
        }
    }, [dispatch, statusFilter, userInfo]);

    useEffect(() => {
        if (userInfo) {
            console.log('Current user info:', userInfo);
            fetchOrders();
        }
    }, [fetchOrders, userInfo]);

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
                return <FiClock className="w-4 h-4 text-yellow-500 mr-2" />;
            case 'pending':
                return <FiPackage className="w-4 h-4 text-blue-500 mr-2" />;
            case 'cancelled':
                return <FiXCircle className="w-4 h-4 text-red-500 mr-2" />;
            case 'warehouse':
                return <FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />;
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

    const getPaymentStatusText = (status, paymentMethod) => {
        switch (status) {
            case 'paid':
                return 'Đã thanh toán';
            case 'pending':
                return paymentMethod === 'cod' ? 'Chờ thanh toán' : 'Chờ xác nhận';
            case 'unpaid':
                return 'Chưa thanh toán';
            case 'failed':
                return 'Thanh toán thất bại';
            default:
                return 'Chờ xác nhận';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'unpaid':
                return 'bg-red-100 text-red-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const redirectToPayment = (order) => {
        navigate(`/payment/${order._id}`);
    };

    const filteredOrders = myOrders?.filter(order => {
        const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.delivery_status === statusFilter;
        return matchesSearch && matchesStatus;
    }) || [];

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'highest':
                return b.price - a.price;
            case 'lowest':
                return a.price - b.price;
            default:
                return 0;
        }
    });

    if (!userInfo) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-600">Vui lòng đăng nhập để xem đơn hàng</h3>
                <Link
                    to="/login"
                    className="inline-block mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    Đăng nhập
                </Link>
            </div>
        );
    }

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
                    onClick={fetchOrders}
                    className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Đơn hàng của tôi</h2>
                
                {/* Search and Filter Section */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-1 sm:max-w-xs">
                        <input
                            type="text"
                            placeholder="Tìm kiếm đơn hàng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    <div className="flex gap-3">
                        <div className="relative">
                            <select
                                className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="placed">Đã đặt hàng</option>
                                <option value="pending">Đang xử lý</option>
                                <option value="cancelled">Đã hủy</option>
                                <option value="warehouse">Đã nhập kho</option>
                            </select>
                            <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select
                                className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="highest">Giá cao nhất</option>
                                <option value="lowest">Giá thấp nhất</option>
                            </select>
                            <FiChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transform rotate-90" />
                        </div>
                    </div>
                </div>
            </div>

            {!myOrders || myOrders.length === 0 ? (
                <div className="text-center py-12">
                    <img
                        src="/images/empty-order.png"
                        alt="No orders"
                        className="w-48 h-48 mx-auto mb-4"
                    />
                    <h3 className="text-lg font-medium text-gray-600">Không có đơn hàng nào</h3>
                    <p className="text-gray-500 mt-2">
                        {searchQuery || statusFilter !== 'all' 
                            ? 'Không tìm thấy đơn hàng phù hợp với bộ lọc'
                            : 'Bạn chưa có đơn hàng nào'}
                    </p>
                    <Link
                        to="/products"
                        className="inline-block mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Mua sắm ngay
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mã đơn hàng
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày đặt
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tổng tiền
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thanh toán
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{order._id.slice(-8).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(order.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatPrice(order.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                                            {getPaymentStatusText(order.payment_status, order.payment_method)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            {getStatusIcon(order.delivery_status)}
                                            <span className="capitalize">{getStatusText(order.delivery_status)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <Link
                                            to={`/dashboard/order/details/${order._id}`}
                                            className="text-red-600 hover:text-red-800 hover:underline"
                                        >
                                            Chi tiết
                                        </Link>
                                        {order.payment_status !== 'paid' && (
                                            <button
                                                onClick={() => redirectToPayment(order)}
                                                className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                                            >
                                                Thanh toán
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Orders;
