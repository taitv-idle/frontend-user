import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import api from '../api/api';
import { toast } from 'react-hot-toast';

/**
 * LƯU Ý VỀ CÁCH CẤU HÌNH STRIPE PAYMENT TRONG HỆ THỐNG:
 * 
 * 1. WEBHOOK:
 * - Webhook là cần thiết để xử lý các thanh toán bất đồng bộ (ví dụ: 3DS, thanh toán bị delay)
 * - Cấu hình trên Stripe Dashboard: https://dashboard.stripe.com/webhooks
 * - Thiết lập webhook endpoint: https://your-domain.com/api/payment/webhook
 * - Sự kiện cần lắng nghe: payment_intent.succeeded, payment_intent.payment_failed
 * - Trong môi trường phát triển: Sử dụng Stripe CLI để test webhook locally
 * 
 * 2. XỬ LÝ ĐƠN VỊ TIỀN TỆ:
 * - Frontend: Hiển thị số tiền dưới dạng VND (ví dụ: 100,000 VND)
 * - API: Gửi số tiền ở dạng nguyên gốc (100000)
 * - Backend: Chuyển đổi từ VND sang smallest unit của Stripe (không cần *100)
 * - LƯU Ý: Stripe xử lý VND không có phần thập phân, nên không cần * 100 như USD
 * 
 * 3. LUỒNG THANH TOÁN:
 * - Tạo đơn hàng -> Tạo payment intent -> Xác nhận thanh toán -> Xử lý webhook -> Cập nhật trạng thái
 * - Nếu có 3DS: redirect người dùng -> xử lý kết quả 3DS -> webhook -> cập nhật trạng thái
 * 
 * 4. THẺ TEST:
 * - Thẻ thành công: 4242 4242 4242 4242
 * - Thẻ yêu cầu xác thực (3DS): 4000 0000 0000 3220
 * - Thẻ bị từ chối: 4000 0000 0000 0002
 * - Ngày hết hạn: Bất kỳ ngày nào trong tương lai
 * - CVC: Bất kỳ 3 con số nào
 * - Zip code: Bất kỳ 5 con số nào
 */

// Constants
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Oml5cGAwoXiNtjJgPPyQngDj9WTjawya4zCsqTn3LPFhl4VvLZZJIh9fW9wqVweFYC5f0YEb9zjUqRpXbkEKT7T00eU1xQvjp';

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
const CheckoutForm = ({ amount, orderId, onSuccess, disabled }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [cardComplete, setCardComplete] = useState(false);

    // Tạo payment intent khi component được tải
    useEffect(() => {
        let isActive = true; // Để tránh memory leak
        
        const createPaymentIntent = async () => {
            if (!amount || !orderId) {
                setError(ERROR_MESSAGES.MISSING_DATA);
                toast.error(ERROR_MESSAGES.MISSING_DATA);
                return;
            }

            try {
                console.log('Creating payment intent for orderId:', orderId, 'amount:', amount);
                
                // Chỉ xóa payment intent cũ nếu đang tạo mới (không cần trong trường hợp sử dụng lại)
                const existingPaymentIntentId = localStorage.getItem('paymentIntentId');
                console.log('Existing payment intent ID:', existingPaymentIntentId || 'none');
                
                // Gửi request để tạo hoặc lấy payment intent
                const { data } = await api.post('/order/create-payment-intent', {
                    price: amount, // Đơn vị VND
                    orderId,
                    // Gửi payment intent ID nếu đã tồn tại để backend có thể kiểm tra
                    existingPaymentIntentId
                });

                console.log('Payment intent response:', data);

                if (!data?.clientSecret) {
                    throw new Error(ERROR_MESSAGES.NO_CLIENT_SECRET);
                }

                if (isActive) {
                    // Lưu orderId để sau khi thanh toán thành công
                    localStorage.setItem('orderId', orderId);
                    
                    // Lưu payment intent ID và client secret cho xác nhận thanh toán sau này
                    if (data.paymentIntentId) {
                        localStorage.setItem('paymentIntentId', data.paymentIntentId);
                        localStorage.setItem('clientSecret', data.clientSecret);
                        console.log('Saved payment intent data to localStorage');
                    }
                    
                    setClientSecret(data.clientSecret);
                    console.log('Client secret set successfully');
                }
            } catch (err) {
                console.error('Payment intent error:', err);
                if (isActive) {
                    const errorMessage = getErrorMessage(err);
                    setError(errorMessage);
                    toast.error(errorMessage);
                }
            }
        };

        createPaymentIntent();
        
        // Cleanup
        return () => {
            isActive = false;
        };
    }, [amount, orderId]);

    // Thêm hàm để kiểm tra trạng thái của payment intent hiện có
    useEffect(() => {
        let isActive = true;
        
        const checkExistingPaymentIntent = async () => {
            // Không làm gì nếu đã có client secret
            if (clientSecret) return;
            
            const existingPaymentIntentId = localStorage.getItem('paymentIntentId');
            const existingOrderId = localStorage.getItem('orderId');
            const existingClientSecret = localStorage.getItem('clientSecret');
            
            // Kiểm tra nếu có payment intent ID và trùng với orderId hiện tại
            if (existingPaymentIntentId && existingOrderId === orderId && existingClientSecret) {
                try {
                    console.log('Using existing payment intent from localStorage');
                    
                    if (isActive) {
                        setClientSecret(existingClientSecret);
                    }
                } catch (err) {
                    console.error('Error using existing payment intent:', err);
                    // Nếu có lỗi, xóa dữ liệu cũ
                    localStorage.removeItem('paymentIntentId');
                    localStorage.removeItem('orderId');
                    localStorage.removeItem('clientSecret');
                }
            } else {
                // Xóa dữ liệu cũ nếu orderId không khớp
                if (existingOrderId !== orderId) {
                    localStorage.removeItem('paymentIntentId');
                    localStorage.removeItem('orderId');
                    localStorage.removeItem('clientSecret');
                }
            }
        };
        
        checkExistingPaymentIntent();
        
        return () => {
            isActive = false;
        };
    }, [orderId, clientSecret]);

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
            // Log thông tin để debug
            console.log('Attempting payment with:', {
                orderId,
                amount,
                hasClientSecret: !!clientSecret,
                clientSecretLength: clientSecret ? clientSecret.length : 0
            });
            
            console.log('Confirming payment with clientSecret:', clientSecret);
            
            // Tạo thông tin thẻ thanh toán
            const paymentData = {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: 'Khách hàng'
                    }
                }
            };
            
            // Nếu cần redirect cho 3DS, thêm return_url
            if (window.location.origin) {
                paymentData.return_url = `${window.location.origin}/order/confirm`;
            }
            
            console.log('Payment data:', paymentData);
            
            // Xác nhận thanh toán
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret, 
                paymentData
            );

            if (stripeError) {
                console.error('Stripe error during confirmation:', stripeError);
                handleStripeError(stripeError);
            } else {
                console.log('Payment confirmed successfully:', paymentIntent);
                
                // Lưu payment intent ID cho xác nhận thanh toán
                if (paymentIntent?.id) {
                    localStorage.setItem('paymentIntentId', paymentIntent.id);
                }
                
                // Xử lý các trạng thái khác nhau
                if (paymentIntent.status === 'succeeded') {
                    // Thanh toán thành công ngay lập tức
                    toast.success('Thanh toán thành công!');
                    window.location.href = `/order/confirm?payment_intent_client_secret=${clientSecret}&payment_intent_id=${paymentIntent.id}`;
                } else if (paymentIntent.status === 'requires_action') {
                    // 3DS sẽ tự xử lý redirect
                    console.log('Waiting for 3D Secure verification...');
                    toast.loading('Đang xác thực thanh toán...');
                } else if (paymentIntent.status === 'requires_payment_method') {
                    // Cần một phương thức thanh toán
                    console.log('Payment requires a payment method');
                    setError('Vui lòng cung cấp thông tin thẻ hợp lệ để thanh toán');
                    toast.error('Vui lòng cung cấp thông tin thẻ hợp lệ để thanh toán');
                    setProcessing(false);
                } else {
                    // Trường hợp khác
                    console.log('Unexpected payment status:', paymentIntent.status);
                    window.location.href = `/order/confirm?payment_intent_client_secret=${clientSecret}`;
                }
            }
        } catch (err) {
            console.error('Error during payment confirmation:', err);
            // Kiểm tra nếu là lỗi payment intent không tồn tại
            if (err.message && (
                err.message.includes('No such payment_intent') || 
                err.message.includes('resource_missing')
            )) {
                // Xóa dữ liệu thanh toán cũ
                localStorage.removeItem('paymentIntentId');
                localStorage.removeItem('orderId');
                localStorage.removeItem('clientSecret');
                setClientSecret('');
                
                // Hiển thị thông báo và tải lại trang để tạo payment intent mới
                toast.error(ERROR_MESSAGES.PAYMENT_INTENT_EXPIRED);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
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
            errorMessage = ERROR_MESSAGES.PAYMENT_INTENT_EXPIRED;
            
            // Xóa payment intent cũ và tải lại trang
            localStorage.removeItem('paymentIntentId');
            localStorage.removeItem('orderId');
            setClientSecret('');
            
            toast.error(errorMessage);
            setTimeout(() => {
                window.location.reload();
            }, 2000);
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
        } else {
            errorMessage = ERROR_MESSAGES.PAYMENT_FAILED;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
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