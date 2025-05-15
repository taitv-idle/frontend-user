import React, { useEffect, useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js'
import error from '../assets/error.png'
import success from '../assets/success.png'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FadeLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import { confirm_stripe_payment } from '../store/reducers/orderReducer';
import { toast } from 'react-hot-toast';

const load = async () => {
    return await loadStripe('pk_test_51Oml5cGAwoXiNtjJgPPyQngDj9WTjawya4zCsqTn3LPFhl4VvLZZJIh9fW9wqVweFYC5f0YEb9zjUqRpXbkEKT7T00eU1xQvjp')
}

const ConfirmOrder = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [loader, setLoader] = useState(true)
    const [stripe, setStripe] = useState(null)
    const [message, setMessage] = useState(null)
    const orderId = localStorage.getItem('orderId')

    useEffect(() => {
        console.log('Initial orderId from localStorage:', orderId);
        console.log('Current URL search params:', location.search);
        
        const loadStripeAndCheckPayment = async () => {
            try {
                console.log('Loading Stripe...');
                const stripeInstance = await load()
                console.log('Stripe loaded successfully');
                setStripe(stripeInstance)
            } catch (error) {
                console.error('Stripe loading error:', error);
                toast.error('Không thể tải Stripe');
                setLoader(false);
            }
        }
        
        loadStripeAndCheckPayment()
    }, [orderId, location.search])

    useEffect(() => {
        if (!stripe) {
            console.log('Stripe not initialized yet');
            return
        }
        
        const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret')
        console.log('Found client secret in URL:', clientSecret ? 'Yes' : 'No');
        
        if (!clientSecret) {
            console.error('No client secret found in URL');
            setMessage('failed');
            setLoader(false);
            return
        }
        
        const checkPaymentStatus = async () => {
            try {
                console.log('Retrieving payment intent...');
                const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret)
                
                console.log('Payment intent retrieved:', paymentIntent);
                console.log('Payment intent status:', paymentIntent.status);
                
                switch(paymentIntent.status){
                    case "succeeded":
                        console.log('Payment succeeded');
                        setMessage('succeeded')
                        break
                    case "processing":
                        console.log('Payment processing');
                        setMessage('processing')
                        break
                    case "requires_payment_method":
                        console.log('Payment requires payment method');
                        setMessage('requires_payment_method')
                        setLoader(false)
                        break
                    default:
                        console.log('Unknown payment status:', paymentIntent.status);
                        setMessage('failed')
                        setLoader(false)
                }
            } catch (error) {
                console.error('Payment intent retrieval error:', error);
                setMessage('failed');
                setLoader(false);
                toast.error('Có lỗi xảy ra khi xác nhận thanh toán');
            }
        }
        
        checkPaymentStatus()
    }, [stripe])

    const update_payment = useCallback(async () => {
        const currentOrderId = localStorage.getItem('orderId');
        const paymentIntentId = localStorage.getItem('paymentIntentId');
        
        console.log('Updating payment for orderId:', currentOrderId);
        console.log('Payment intent ID:', paymentIntentId);
        
        if (!currentOrderId) {
            console.error('No orderId found in localStorage');
            toast.error('Không tìm thấy mã đơn hàng');
            setLoader(false);
            return;
        }
        
        if (!paymentIntentId) {
            console.error('No paymentIntentId found in localStorage');
            toast.error('Không tìm thấy mã giao dịch thanh toán');
            setLoader(false);
            return;
        }
        
        try {
            console.log('Calling confirm payment API...');
            // Gọi API để cập nhật trạng thái thanh toán kèm theo paymentIntentId
            const result = await dispatch(confirm_stripe_payment({
                orderId: currentOrderId,
                paymentIntentId
            })).unwrap();
            
            console.log('Payment confirmation result:', result);
            
            // Xóa dữ liệu đã lưu trong localStorage
            localStorage.removeItem('orderId');
            localStorage.removeItem('paymentIntentId');
            console.log('Removed payment data from localStorage');
            
            // Chờ một chút để người dùng thấy thông báo thành công
            setTimeout(() => {
                toast.success('Thanh toán thành công!');
                navigate('/dashboard/my-orders');
            }, 1500);
            
            setLoader(false);
        } catch (error) {
            console.error('Payment confirmation error:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi xác nhận thanh toán');
            setLoader(false);
        }
    }, [dispatch, navigate]);

    useEffect(() => {
        console.log('Current message state:', message);
        
        if (message === 'succeeded') {
            console.log('Payment succeeded, updating payment status...');
            update_payment()
        } else if (message === 'processing') {
            console.log('Payment is processing...');
            toast.loading('Đang xử lý thanh toán, vui lòng chờ...');
        }
    }, [message, update_payment])

    const returnToPayment = () => {
        const currentOrderId = localStorage.getItem('orderId');
        
        if (currentOrderId) {
            // Chuyển hướng đến trang thanh toán với orderId
            navigate('/payment', {
                state: {
                    orderInfo: {
                        orderId: currentOrderId,
                        totalPrice: 0, // Giá trị này sẽ được lấy từ backend
                        paymentMethod: 'stripe'
                    }
                }
            });
        } else {
            // Nếu không có orderId, chuyển về trang danh sách đơn hàng
            navigate('/dashboard/my-orders');
        }
    };

    return (
        <div className='w-screen h-screen flex justify-center items-center flex-col gap-4'>
            {
                message === 'failed' ? (
                    <>
                        <img src={error} alt="Payment failed" />
                        <p className="text-red-600 font-medium">Thanh toán thất bại</p>
                        <Link 
                            className='px-5 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors' 
                            to="/dashboard/my-orders"
                        >
                            Quay lại đơn hàng
                        </Link>
                    </>
                ) : message === 'requires_payment_method' ? (
                    <>
                        <img src={error} alt="Payment incomplete" />
                        <p className="text-orange-600 font-medium">Cần cung cấp thông tin thanh toán</p>
                        <p className="text-gray-600 text-center max-w-md">
                            Thanh toán chưa hoàn tất. Bạn cần cung cấp thông tin thẻ hợp lệ để hoàn tất thanh toán.
                        </p>
                        <button 
                            className='px-5 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors'
                            onClick={returnToPayment}
                        >
                            Quay lại trang thanh toán
                        </button>
                    </>
                ) : message === 'processing' ? (
                    <>
                        <FadeLoader color="#f56565" />
                        <p className="text-gray-600">Đang xử lý thanh toán...</p>
                    </> 
                ) : message === 'succeeded' ? (
                    loader ? (
                        <FadeLoader color="#f56565" />
                    ) : (
                        <>
                            <img src={success} alt="Payment success" />
                            <p className="text-green-600 font-medium">Thanh toán thành công!</p>
                            <Link 
                                className='px-5 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors' 
                                to="/dashboard/my-orders"
                            >
                                Xem đơn hàng
                            </Link>
                        </>
                    )
                ) : (
                    <>
                        <FadeLoader color="#f56565" />
                        <p className="text-gray-600">Đang kiểm tra thanh toán...</p>
                    </>
                )
            }
        </div>
    );
};

export default ConfirmOrder;