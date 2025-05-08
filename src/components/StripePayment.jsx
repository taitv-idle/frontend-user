import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import api from '../api/api';
import { toast } from 'react-hot-toast';

// Constants
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51NkKjoLGiNne9ofSvfgCBu4tSouG22SMn1vjKSFsEIzthLfm6PGAPp5Fk5rMjVqrEw5leYaCI3a2NTO1yHQyBmwb00k1Jj5137';
const EXCHANGE_RATE = 24500; // VND to USD exchange rate
const STRIPE_AMOUNT_MULTIPLIER = 100; // Convert USD to cents

// Card element styling
const cardElementOptions = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
                color: '#aab7c4',
            },
        },
        invalid: {
            color: '#9e2146',
        },
    },
    hidePostalCode: true
};

// Error messages
const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.',
    TIMEOUT_ERROR: 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại sau.',
    AD_BLOCKER: 'Không thể kết nối với hệ thống thanh toán. Vui lòng tắt các extension chặn quảng cáo và thử lại.',
    MISSING_DATA: 'Thiếu thông tin cần thiết để tạo thanh toán',
    PAYMENT_FAILED: 'Thanh toán thất bại',
    STRIPE_NOT_READY: 'Stripe chưa được khởi tạo',
    FORM_NOT_READY: 'Form thanh toán chưa sẵn sàng',
    NO_PAYMENT_INFO: 'Chưa có thông tin thanh toán',
    NO_CLIENT_SECRET: 'Không nhận được client secret từ server'
};

// Helper functions
const convertVNDtoUSD = (amount) => (amount * 1000) / EXCHANGE_RATE;
const convertUSDtoCents = (amount) => Math.round(amount * STRIPE_AMOUNT_MULTIPLIER);

// Component con xử lý form thanh toán
const CheckoutForm = ({ amount, orderId, onSuccess, disabled }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [cardComplete, setCardComplete] = useState(false);

    useEffect(() => {
        const createPaymentIntent = async () => {
            if (!amount || !orderId) {
                setError(ERROR_MESSAGES.MISSING_DATA);
                toast.error(ERROR_MESSAGES.MISSING_DATA);
                return;
            }

            try {
                const amountInUSD = convertVNDtoUSD(amount);
                const amountInCents = convertUSDtoCents(amountInUSD);
                
                console.log('Creating payment intent for amount:', amountInUSD, 'USD');
                
                const { data } = await api.post('/order/create-payment', {
                    price: amountInCents,
                    orderId
                });

                if (!data?.clientSecret) {
                    throw new Error(ERROR_MESSAGES.NO_CLIENT_SECRET);
                }

                setClientSecret(data.clientSecret);
            } catch (err) {
                console.error('Payment intent error:', err);
                const errorMessage = getErrorMessage(err);
                setError(errorMessage);
                toast.error(errorMessage);
            }
        };

        createPaymentIntent();
    }, [amount, orderId]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateStripeReady()) {
            return;
        }

        if (!cardComplete) {
            setError('Vui lòng nhập đầy đủ thông tin thẻ thanh toán');
            toast.error('Vui lòng nhập đầy đủ thông tin thẻ thanh toán');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: 'Customer Name'
                    }
                }
            });

            if (stripeError) {
                handleStripeError(stripeError);
            } else if (paymentIntent.status === 'succeeded') {
                // Cập nhật trạng thái thanh toán
                try {
                    await api.put(`/order/update-payment-status/${orderId}`, {
                        paymentStatus: 'paid',
                        paymentMethod: 'stripe'
                    });
                    handlePaymentSuccess();
                } catch (err) {
                    console.error('Error updating payment status:', err);
                    toast.error('Thanh toán thành công nhưng không thể cập nhật trạng thái. Vui lòng liên hệ hỗ trợ.');
                }
            }
        } catch (err) {
            handlePaymentError(err);
        } finally {
            setProcessing(false);
        }
    };

    const handleCardChange = (event) => {
        setCardComplete(event.complete);
        if (event.error) {
            setError(event.error.message);
        } else {
            setError('');
        }
    };

    const validateStripeReady = () => {
        if (!stripe) {
            toast.error(ERROR_MESSAGES.STRIPE_NOT_READY);
            return false;
        }
        if (!elements) {
            toast.error(ERROR_MESSAGES.FORM_NOT_READY);
            return false;
        }
        if (!clientSecret) {
            toast.error(ERROR_MESSAGES.NO_PAYMENT_INFO);
            return false;
        }
        return true;
    };

    const handleStripeError = (stripeError) => {
        const errorMessage = stripeError.type === 'card_error' 
            ? stripeError.message 
            : stripeError.type === 'network_error'
                ? ERROR_MESSAGES.AD_BLOCKER
                : ERROR_MESSAGES.PAYMENT_FAILED;
        
        setError(errorMessage);
        toast.error(errorMessage);
    };

    const handlePaymentSuccess = () => {
        toast.success('Thanh toán thành công!');
        // Chuyển hướng đến trang xác nhận đơn hàng
        window.location.href = '/order-confirmation';
        onSuccess();
    };

    const handlePaymentError = (err) => {
        console.error('Payment error:', err);
        const errorMessage = err.message.includes('Failed to fetch') || err.message.includes('ERR_BLOCKED_BY_CLIENT')
            ? ERROR_MESSAGES.AD_BLOCKER
            : err.response?.data?.message || ERROR_MESSAGES.PAYMENT_FAILED;
        
        setError(errorMessage);
        toast.error(errorMessage);
    };

    if (!clientSecret) {
        return <LoadingSpinner />;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border border-gray-300 p-3 rounded-md">
                <CardElement 
                    options={cardElementOptions}
                    onChange={handleCardChange}
                />
            </div>

            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}

            <button
                type="submit"
                disabled={!stripe || processing || disabled || !cardComplete}
                className={`w-full py-3 rounded-md font-medium text-white transition ${
                    processing || disabled || !cardComplete ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {processing ? 'Đang xử lý...' : `Thanh toán ${(amount * 1000).toLocaleString('vi-VN')}₫`}
            </button>

            <PaymentLogos />
            <SecurityNotice />
        </form>
    );
};

// Sub-components
const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

const PaymentLogos = () => (
    <div className="flex items-center justify-center gap-2">
        <img src="/images/payment/visa.png" alt="Visa" className="h-6 object-contain" />
        <img src="/images/payment/mastercard.png" alt="Mastercard" className="h-6 object-contain" />
        <img src="/images/payment/jcb.png" alt="JCB" className="h-6 object-contain" />
    </div>
);

const SecurityNotice = () => (
    <p className="text-xs text-gray-500 text-center">
        Thanh toán an toàn với Stripe - Chúng tôi không lưu trữ thông tin thẻ của bạn
    </p>
);

// Helper function to get error message
const getErrorMessage = (error) => {
    if (error.code === 'ERR_NETWORK') return ERROR_MESSAGES.NETWORK_ERROR;
    if (error.code === 'ECONNABORTED') return ERROR_MESSAGES.TIMEOUT_ERROR;
    if (error.response?.data?.message) return error.response.data.message;
    return error.message || ERROR_MESSAGES.PAYMENT_FAILED;
};

// Component chính bọc Elements provider
const StripePayment = ({ amount, orderId, onSuccess, disabled }) => {
    const [adBlockerDetected, setAdBlockerDetected] = useState(false);

    useEffect(() => {
        const checkAdBlocker = async () => {
            try {
                await fetch('https://r.stripe.com/b', {
                    method: 'POST',
                    mode: 'no-cors'
                });
                setAdBlockerDetected(false);
            } catch (error) {
                if (error.message.includes('Failed to fetch') || error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
                    setAdBlockerDetected(true);
                }
            }
        };

        checkAdBlocker();
    }, []);

    if (adBlockerDetected) {
        return <AdBlockerWarning />;
    }

    if (!STRIPE_PUBLISHABLE_KEY) {
        return <PaymentSystemError />;
    }

    return (
        <Elements stripe={loadStripe(STRIPE_PUBLISHABLE_KEY)}>
            <CheckoutForm 
                amount={amount} 
                orderId={orderId} 
                onSuccess={onSuccess} 
                disabled={disabled} 
            />
        </Elements>
    );
};

// Warning components
const AdBlockerWarning = () => (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">Phát hiện extension chặn quảng cáo</h3>
        <p className="text-yellow-700 mb-4">Để thanh toán được thực hiện, vui lòng:</p>
        <ol className="list-decimal list-inside text-yellow-700 space-y-2">
            <li>Tắt các extension chặn quảng cáo (AdBlock, uBlock Origin, etc.)</li>
            <li>Hoặc thêm trang web này vào whitelist của extension</li>
            <li>Sau đó làm mới trang và thử lại</li>
        </ol>
    </div>
);

const PaymentSystemError = () => (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-700">
            Không thể kết nối với hệ thống thanh toán. Vui lòng thử lại sau.
        </p>
    </div>
);

export default StripePayment;