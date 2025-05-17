import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import api from '../api/api';
import { toast } from 'react-hot-toast';


const STRIPE_PUBLISHABLE_KEY = 'pk_test_51NkKjoLGiNne9ofSvfgCBu4tSouG22SMn1vjKSFsEIzthLfm6PGAPp5Fk5rMjVqrEw5leYaCI3a2NTO1yHQyBmwb00k1Jj5137';

// Kiểm tra Stripe key
if (!STRIPE_PUBLISHABLE_KEY) {
    console.error('Stripe publishable key is missing');
}

// Khởi tạo Stripe promise
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Card element styling
const cardElementOptions = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
                color: '#aab7c4',
            },
            ':-webkit-autofill': {
                color: '#424770',
            },
        },
        invalid: {
            color: '#9e2146',
            iconColor: '#9e2146',
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
    NO_CLIENT_SECRET: 'Không nhận được client secret từ server',
    PAYMENT_INTENT_MISSING: 'Không nhận được thông tin thanh toán từ server',
    CARD_DECLINED: 'Thẻ bị từ chối. Vui lòng kiểm tra lại thông tin thẻ hoặc thử thẻ khác.',
    CARD_EXPIRED: 'Thẻ đã hết hạn. Vui lòng sử dụng thẻ khác.',
    INCORRECT_CVC: 'Mã CVC không đúng. Vui lòng kiểm tra lại.',
    INSUFFICIENT_FUNDS: 'Số dư không đủ để thực hiện giao dịch.',
    PAYMENT_INTENT_EXPIRED: 'Phiên thanh toán đã hết hạn. Vui lòng tạo một phiên thanh toán mới.'
};

// Component con xử lý form thanh toán
const CheckoutForm = ({ amount, orderId, onSuccess, disabled, recoveryMode, apiStatus }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [cardComplete, setCardComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [adBlockerDetected, setAdBlockerDetected] = useState(false);

    // Kiểm tra ad blocker khi component mount
    useEffect(() => {
        checkForAdBlocker();
    }, []);

    const checkForAdBlocker = async () => {
        const testUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        try {
            await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' });
            setAdBlockerDetected(false);
        } catch (e) {
            console.log('Ad blocker detected');
            setAdBlockerDetected(true);
        }
    };

    // Kiểm tra token khi component mount
    useEffect(() => {
        const token = localStorage.getItem('customerToken');
        console.log('Initial token check:', {
            hasToken: !!token,
            tokenLength: token ? token.length : 0,
            tokenStart: token ? token.substring(0, 10) + '...' : 'none'
        });
    }, []);

    const handleAuthError = () => {
        console.log('Handling auth error...');
        const currentPath = window.location.pathname + window.location.search;
        console.log('Current path:', currentPath);
        if (currentPath !== '/login') {
            console.log('Setting redirect path...');
            localStorage.setItem('redirectAfterLogin', currentPath);
            setShowLoginPrompt(true);
        }
    };

    // Hàm khởi tạo lại payment intent
    const resetAndCreateNewPaymentIntent = () => {
        console.log('Resetting and creating new payment intent...');
        // Đặt lại trạng thái
        setClientSecret('');
        setIsInitialized(false);
        setIsLoading(true);
        setError('');
    };

    // Add API connectivity status check
    useEffect(() => {
        // If API is not connecting, show error
        if (apiStatus && (apiStatus.includes('Không thể kết nối') || apiStatus.includes('Lỗi'))) {
            setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại sau.');
        }
    }, [apiStatus]);

    // Modify createPaymentIntent to handle API connectivity issues
    useEffect(() => {
        let isActive = true;
        let retryCount = 0;
        const MAX_RETRIES = 2;
        
        const createPaymentIntent = async () => {
            console.log('Starting createPaymentIntent... Retry count:', retryCount);
            if (isInitialized && clientSecret) {
                console.log('Already initialized, returning...');
                return;
            }

            if (!amount || !orderId) {
                console.log('Missing amount or orderId:', { amount, orderId });
                setError(ERROR_MESSAGES.MISSING_DATA);
                toast.error(ERROR_MESSAGES.MISSING_DATA);
                setIsLoading(false);
                return;
            }

            // Check if API is working before trying to create payment intent
            if (apiStatus && (apiStatus.includes('Không thể kết nối') || apiStatus.includes('Lỗi'))) {
                console.log('API connection issues detected, showing error');
                setError('Không thể kết nối đến máy chủ thanh toán. Vui lòng kiểm tra kết nối mạng và thử lại sau.');
                toast.error('Không thể kết nối đến máy chủ thanh toán');
                setIsLoading(false);
                return;
            }

            try {
                console.log('Checking token...');
                const token = localStorage.getItem('customerToken');
                
                if (!token) {
                    console.log('No token found, showing error...');
                    setError('Vui lòng đăng nhập để tiếp tục thanh toán');
                    toast.error('Vui lòng đăng nhập để tiếp tục thanh toán');
                    handleAuthError();
                    return;
                }

                // Kiểm tra token có hợp lệ không
                try {
                    const tokenParts = token.split('.');
                    if (tokenParts.length !== 3) {
                        throw new Error('Invalid token format');
                    }
                    const payload = JSON.parse(atob(tokenParts[1]));
                    const expirationTime = payload.exp * 1000; // Convert to milliseconds
                    if (Date.now() >= expirationTime) {
                        throw new Error('Token expired');
                    }
                    console.log('Token is valid, expiration:', new Date(expirationTime).toLocaleString());
                } catch (tokenError) {
                    console.error('Token validation error:', tokenError);
                    localStorage.removeItem('customerToken'); // Xóa token không hợp lệ
                    setError('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
                    toast.error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
                    handleAuthError();
                    return;
                }

                // Tính toán tổng tiền bao gồm phí vận chuyển
                const shippingFee = amount >= 500000 ? 0 : 40000;
                const totalAmount = amount + shippingFee;

                console.log('Creating payment intent with data:', {
                    price: totalAmount,
                    orderId,
                    priceType: typeof totalAmount,
                    orderIdType: typeof orderId
                });
                
                try {
                    // Thêm timeout để tránh các vấn đề về mạng
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 giây timeout
                    
                    const response = await api.post('/payment/create-payment-intent', {
                        price: totalAmount,
                        orderId
                    }, {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);

                    console.log('API Response:', response);

                    if (!response.data) {
                        throw new Error('No data received from server');
                    }

                    const { data } = response;

                    console.log('Payment intent response:', data);

                    if (!data?.success) {
                        throw new Error(data?.message || ERROR_MESSAGES.PAYMENT_FAILED);
                    }

                    if (!data?.clientSecret) {
                        throw new Error(ERROR_MESSAGES.NO_CLIENT_SECRET);
                    }

                    if (isActive) {
                        console.log('Setting client secret and updating state...');
                        const paymentIntentId = data.clientSecret.split('_secret_')[0];
                        console.log('Payment Intent ID:', paymentIntentId);
                        
                        // Lưu cả payment intent ID và client secret
                        setClientSecret(data.clientSecret);
                        
                        setIsLoading(false);
                        setIsInitialized(true);
                        // Reset retry count on success
                        retryCount = 0;
                    }
                } catch (apiError) {
                    console.error('API Error:', {
                        message: apiError.message,
                        response: apiError.response?.data,
                        status: apiError.response?.status,
                        headers: apiError.response?.headers
                    });
                    throw apiError;
                }
            } catch (err) {
                console.error('Payment intent error:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                    stack: err.stack
                });
                
                if (isActive) {
                    if (err.message === 'Unauthorized' || err.response?.status === 401) {
                        console.log('Unauthorized error, handling auth error...');
                        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                        handleAuthError();
                    } else if (err.response?.data?.message?.includes('hết hạn') || err.message.includes('failed')) {
                        console.log('Payment intent expired or failed, retrying...');
                        setIsInitialized(false);
                        setError('Phiên thanh toán đã hết hạn. Đang tạo phiên mới...');
                        toast.error('Phiên thanh toán đã hết hạn. Đang tạo phiên mới...');
                        // Tự động thử lại nhưng có giới hạn số lần thử
                        if (retryCount < MAX_RETRIES) {
                            retryCount++;
                            setTimeout(() => {
                                if (isActive) createPaymentIntent();
                            }, 2000);
                        } else {
                            setError('Không thể tạo phiên thanh toán sau nhiều lần thử. Vui lòng làm mới trang.');
                            toast.error('Không thể tạo phiên thanh toán sau nhiều lần thử. Vui lòng làm mới trang.');
                        }
                    } else {
                        const errorMessage = getErrorMessage(err);
                        console.error('Payment error details:', {
                            errorMessage,
                            originalError: err
                        });
                        setError(errorMessage);
                        toast.error(errorMessage);
                    }
                    setIsLoading(false);
                }
            }
        };

        createPaymentIntent();
        
        return () => {
            isActive = false;
        };
    }, [amount, orderId, isInitialized, clientSecret, apiStatus]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        // Kiểm tra ad blocker
        if (adBlockerDetected) {
            setError(ERROR_MESSAGES.AD_BLOCKER);
            toast.error(ERROR_MESSAGES.AD_BLOCKER);
            return;
        }

        const token = localStorage.getItem('customerToken');
        if (!token) {
            setError('Vui lòng đăng nhập để tiếp tục thanh toán');
            toast.error('Vui lòng đăng nhập để tiếp tục thanh toán');
            handleAuthError();
            return;
        }

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
            const paymentData = {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: 'Khách hàng'
                    }
                }
            };
            
            console.log('Confirming payment with client secret:', clientSecret);
            console.log('Payment Intent ID:', clientSecret.split('_secret_')[0]);
            
            // Thử xác nhận thanh toán với timeout
            const confirmPaymentWithTimeout = async () => {
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Payment confirmation timeout')), 30000)
                );
                
                const confirmPromise = stripe.confirmCardPayment(clientSecret, paymentData);
                
                return Promise.race([confirmPromise, timeoutPromise]);
            };
            
            const { error: stripeError, paymentIntent } = await confirmPaymentWithTimeout();

            if (stripeError) {
                console.error('Stripe error during confirmation:', stripeError);
                handleStripeError(stripeError);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                try {
                    const { data } = await api.patch(`/payment/confirm-payment/${orderId}`, {
                        paymentIntentId: paymentIntent.id
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (!data?.success) {
                        throw new Error(data?.message || 'Xác nhận thanh toán thất bại');
                    }
                    
                    toast.success('Thanh toán thành công!');
                    window.location.href = `/order-confirmation/${orderId}`;
                } catch (confirmError) {
                    console.error('Error confirming payment with backend:', confirmError);
                    if (confirmError.response?.status === 401 || confirmError.response?.status === 403) {
                        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                        handleAuthError();
                    } else {
                        toast.error(confirmError.response?.data?.message || 'Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng liên hệ hỗ trợ.');
                    }
                }
            } else if (paymentIntent.status === 'requires_action') {
                console.log('Waiting for 3D Secure verification...');
                toast.loading('Đang xác thực thanh toán...');
            } else {
                console.log('Unexpected payment status:', paymentIntent.status);
                toast.error('Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.');
            }
        } catch (err) {
            console.error('Error during payment confirmation:', err);
            if (err.message === 'Payment confirmation timeout') {
                setError('Xác nhận thanh toán quá thời gian. Vui lòng thử lại.');
                toast.error('Xác nhận thanh toán quá thời gian. Vui lòng thử lại.');
            } else {
                handlePaymentError(err);
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleCardChange = (event) => {
        console.log('Card change event:', { 
            complete: event.complete, 
            elementType: event.elementType,
            empty: event.empty,
            error: event.error ? event.error.message : 'none'
        });
        
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
        console.error('Stripe error details:', stripeError);
        let errorMessage;
        
        // Xử lý lỗi resource_missing đặc biệt (payment intent không tồn tại hoặc đã hết hạn)
        if (stripeError.code === 'resource_missing') {
            console.log('Payment intent không tồn tại, tạo mới payment intent...');
            errorMessage = ERROR_MESSAGES.PAYMENT_INTENT_EXPIRED;
            
            // Xóa trạng thái và tạo mới payment intent
            setClientSecret('');
            setIsInitialized(false);
            
            toast.error(errorMessage);
            
            // Tạo mới payment intent sau 1 giây
            setTimeout(() => {
                // Reset trạng thái để kích hoạt useEffect tạo mới payment intent
                resetAndCreateNewPaymentIntent();
            }, 1000);
            
            return; // Kết thúc hàm ở đây để không thực hiện các xử lý khác
        }
        // Xử lý các lỗi thẻ phổ biến
        else if (stripeError.type === 'card_error') {
            switch(stripeError.code) {
                case 'card_declined':
                    errorMessage = ERROR_MESSAGES.CARD_DECLINED;
                    break;
                case 'expired_card':
                    errorMessage = ERROR_MESSAGES.CARD_EXPIRED;
                    break;
                case 'incorrect_cvc':
                    errorMessage = ERROR_MESSAGES.INCORRECT_CVC;
                    break;
                case 'insufficient_funds':
                    errorMessage = ERROR_MESSAGES.INSUFFICIENT_FUNDS;
                    break;
                case 'processing_error':
                    errorMessage = 'Lỗi xử lý giao dịch. Vui lòng thử lại.';
                    break;
                case 'invalid_expiry_month':
                    errorMessage = 'Tháng hết hạn không hợp lệ.';
                    break;
                case 'invalid_expiry_year':
                    errorMessage = 'Năm hết hạn không hợp lệ.';
                    break;
                case 'incorrect_number':
                    errorMessage = 'Số thẻ không hợp lệ.';
                    break;
                case 'incorrect_zip':
                    errorMessage = 'Mã bưu điện không hợp lệ.';
                    break;
                default:
                    errorMessage = stripeError.message;
            }
        } else if (stripeError.type === 'validation_error') {
            errorMessage = stripeError.message;
        } else if (stripeError.type === 'network_error') {
            errorMessage = ERROR_MESSAGES.AD_BLOCKER;
            setAdBlockerDetected(true);
        } else {
            errorMessage = ERROR_MESSAGES.PAYMENT_FAILED;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
    };

    const handlePaymentError = (err) => {
        console.error('Payment error:', err);
        if (err.message.includes('Failed to fetch') || err.message.includes('ERR_BLOCKED_BY_CLIENT')) {
            setAdBlockerDetected(true);
            setError(ERROR_MESSAGES.AD_BLOCKER);
            toast.error(ERROR_MESSAGES.AD_BLOCKER);
        } else {
            const errorMessage = err.response?.data?.message || ERROR_MESSAGES.PAYMENT_FAILED;
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    if (adBlockerDetected) {
        return <AdBlockerWarning />;
    }

    if (showLoginPrompt) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Yêu cầu đăng nhập</h3>
                <p className="text-yellow-700 mb-4">Vui lòng đăng nhập để tiếp tục thanh toán</p>
                <button
                    onClick={() => window.location.href = '/login'}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                    Đăng nhập ngay
                </button>
            </div>
        );
    }

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!clientSecret) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700">Không thể tạo phiên thanh toán. Vui lòng thử lại sau.</p>
                <button 
                    onClick={resetAndCreateNewPaymentIntent}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    // Add conditional rendering for API connectivity issues
    if (apiStatus && (apiStatus.includes('Không thể kết nối') || apiStatus.includes('Lỗi'))) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <h3 className="text-lg font-medium text-red-800 mb-2">Lỗi kết nối máy chủ</h3>
                <p className="text-red-700 mb-4">Không thể kết nối đến máy chủ thanh toán. Vui lòng kiểm tra:</p>
                <ol className="list-decimal list-inside text-red-700 space-y-2">
                    <li>Kết nối mạng của bạn</li>
                    <li>Máy chủ có thể đang bảo trì hoặc gặp sự cố</li>
                    <li>Vui lòng làm mới trang và thử lại sau</li>
                </ol>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Làm mới trang
                </button>
            </div>
        );
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
                    processing || disabled || !cardComplete ? 'bg-red-400' : 'bg-red-500 hover:bg-red-600'
                }`}
            >
                {processing ? 'Đang xử lý...' : `Thanh toán ${(amount).toLocaleString('vi-VN')}₫`}
            </button>

            <PaymentLogos />
            <SecurityNotice />
        </form>
    );
};

// Sub-components
const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
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
    <div className="text-center space-y-2">
        <p className="text-xs text-gray-500">
            Thanh toán an toàn với Stripe - Chúng tôi không lưu trữ thông tin thẻ của bạn
        </p>
        <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mt-2">
            <p className="text-xs font-medium text-blue-700 mb-1">Thẻ test (chỉ dùng cho môi trường phát triển):</p>
            <p className="text-xs text-blue-700">- Thẻ thành công: <span className="font-medium">4242 4242 4242 4242</span></p>
            <p className="text-xs text-blue-700">- Thẻ cần xác thực: <span className="font-medium">4000 0000 0000 3220</span></p>
            <p className="text-xs text-blue-700">- Ngày hết hạn: Bất kỳ ngày nào trong tương lai</p>
            <p className="text-xs text-blue-700">- CVC: 3 chữ số bất kỳ</p>
        </div>
    </div>
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
    const [stripeError, setStripeError] = useState(null);
    const [recoveryMode, setRecoveryMode] = useState(false);

    useEffect(() => {
        // Kiểm tra Stripe key khi component mount
        if (!STRIPE_PUBLISHABLE_KEY) {
            setStripeError('Stripe publishable key is missing');
            return;
        }

        // Kiểm tra kết nối với Stripe
        const checkStripeConnection = async () => {
            try {
                const stripe = await stripePromise;
                if (!stripe) {
                    throw new Error('Failed to load Stripe');
                }
                setStripeError(null);
            } catch (error) {
                console.error('Stripe connection error:', error);
                setStripeError('Không thể kết nối với hệ thống thanh toán');
            }
        };

        checkStripeConnection();
    }, []);

    const handleRecovery = () => {
        console.log('Entering recovery mode...');
        setRecoveryMode(true);

        // Force reload the component
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    if (stripeError) {
        return (
            <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700">{stripeError}</p>
                </div>
                <button
                    onClick={handleRecovery}
                    className="w-full py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                    Thử khởi tạo lại phiên thanh toán
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Elements stripe={stripePromise}>
                <CheckoutForm 
                    amount={amount} 
                    orderId={orderId} 
                    onSuccess={onSuccess} 
                    disabled={disabled}
                    recoveryMode={recoveryMode}
                />
            </Elements>
        </div>
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

export default StripePayment;