import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import api from '../api/api';
import { toast } from 'react-hot-toast';

const StripePayment = ({ amount, orderId, onSuccess, disabled }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setError('');

        try {
            // 1. Tạo payment intent
            const { data: { clientSecret } } = await api.post('/payment/create-payment-intent', {
                amount: amount * 1000, // Chuyển sang VND
                orderId
            });

            // 2. Xác nhận thanh toán với Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: 'Customer Name' // Có thể lấy từ user info
                    }
                }
            });

            if (stripeError) {
                setError(stripeError.message);
                toast.error(stripeError.message);
            } else if (paymentIntent.status === 'succeeded') {
                toast.success('Thanh toán thành công!');
                onSuccess();
            }
        } catch (error) {
            console.error('Payment error:', error);
            setError(error.response?.data?.message || 'Thanh toán thất bại');
            toast.error(error.response?.data?.message || 'Thanh toán thất bại');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border border-gray-300 p-3 rounded-md">
                <CardElement
                    options={{
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
                    }}
                />
            </div>

            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}

            <button
                type="submit"
                disabled={!stripe || processing || disabled}
                className={`w-full py-3 rounded-md font-medium text-white transition ${
                    processing || disabled ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {processing ? 'Đang xử lý...' : `Thanh toán ${(amount * 1000).toLocaleString('vi-VN')}₫`}
            </button>

            <div className="flex items-center justify-center gap-2">
                <img
                    src="/images/payment/visa.png"
                    alt="Visa"
                    className="h-6 object-contain"
                />
                <img
                    src="/images/payment/mastercard.png"
                    alt="Mastercard"
                    className="h-6 object-contain"
                />
                <img
                    src="/images/payment/jcb.png"
                    alt="JCB"
                    className="h-6 object-contain"
                />
            </div>

            <p className="text-xs text-gray-500 text-center">
                Thanh toán an toàn với Stripe - Chúng tôi không lưu trữ thông tin thẻ của bạn
            </p>
        </form>
    );
};

export default StripePayment;