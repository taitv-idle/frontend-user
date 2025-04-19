import React, { useEffect, useCallback } from 'react';
import { RiLoader4Line, RiCloseCircleFill } from "react-icons/ri";
import { FiShoppingBag, FiEye, FiDollarSign } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { get_dashboard_index_data } from '../../store/reducers/dashboardReducer';
import { ClipLoader } from 'react-spinners';

const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const { recentOrders, totalOrder, pendingOrder, cancelledOrder, isLoading } = useSelector(state => state.dashboard);

    useEffect(() => {
        dispatch(get_dashboard_index_data(userInfo.id));
    }, [dispatch, userInfo.id]);

    const redirectToPayment = useCallback((order) => {
        const totalItems = order.products.reduce((sum, product) => sum + product.quantity, 0);
        navigate('/payment', {
            state: {
                price: order.price,
                items: totalItems,
                orderId: order._id
            }
        });
    }, [navigate]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const getStatusBadge = (status) => {
        const baseClasses = "text-xs font-medium px-2.5 py-1 rounded-full";
        switch (status) {
            case 'paid':
                return <span className={`${baseClasses} bg-emerald-100 text-emerald-800`}>Đã thanh toán</span>;
            case 'pending':
                return <span className={`${baseClasses} bg-amber-100 text-amber-800`}>Đang xử lý</span>;
            case 'cancelled':
                return <span className={`${baseClasses} bg-red-100 text-red-800`}>Đã hủy</span>;
            default:
                return <span className={`${baseClasses} bg-gray-100 text-gray-600`}>{status}</span>;
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Orders Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <FiShoppingBag className="text-xl" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tổng đơn hàng</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalOrder}</h3>
                        </div>
                    </div>
                </div>

                {/* Pending Orders Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                            <RiLoader4Line className="text-xl" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Đơn đang xử lý</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{pendingOrder}</h3>
                        </div>
                    </div>
                </div>

                {/* Cancelled Orders Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-red-50 rounded-lg text-red-600">
                            <RiCloseCircleFill className="text-xl" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Đơn đã hủy</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{cancelledOrder}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Đơn hàng gần đây</h2>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <ClipLoader color="#3B82F6" size={30} />
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>Không có đơn hàng nào gần đây</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {recentOrders.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{order._id.slice(-6).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatPrice(order.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(order.payment_status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(order.delivery_status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <Link
                                            to={`/dashboard/order/details/${order._id}`}
                                            className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                                        >
                                            <FiEye className="mr-1" /> Xem
                                        </Link>
                                        {order.payment_status !== 'paid' && (
                                            <button
                                                onClick={() => redirectToPayment(order)}
                                                className="text-emerald-600 hover:text-emerald-800 inline-flex items-center"
                                            >
                                                <FiDollarSign className="mr-1" /> Thanh toán
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
        </div>
    );
};

export default Dashboard;