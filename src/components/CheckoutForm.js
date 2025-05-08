import React, { useState } from 'react';
import { PaymentElement, LinkAuthenticationElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';

const CheckoutForm = ({ orderId }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/order/confirm`,
                },
            });

            if (error) {
                setMessage(error.message);
                toast.error(error.message);
            }
        } catch (err) {
            console.error('Payment error:', err);
            setMessage('Đã xảy ra lỗi không mong muốn');
            toast.error('Đã xảy ra lỗi không mong muốn');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <LinkAuthenticationElement 
                    id="link-authentication-element"
                    className="p-4 border rounded-md"
                />
                <PaymentElement 
                    id="payment-element" 
                    options={{
                        layout: 'tabs',
                        defaultValues: {
                            billingDetails: {
                                name: 'Customer Name'
                            }
                        }
                    }}
                    className="p-4 border rounded-md"
                />
            </div>

            {message && (
                <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm">
                    {message}
                </div>
            )}

            <button
                disabled={isLoading || !stripe || !elements}
                className={`w-full py-3 px-4 rounded-md font-medium text-white transition ${
                    isLoading || !stripe || !elements
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                }`}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                        Đang xử lý...
                    </div>
                ) : (
                    'Thanh toán ngay'
                )}
            </button>

            <div className="flex items-center justify-center gap-4">
                <img src="/images/payment/visa.png" alt="Visa" className="h-8" />
                <img src="/images/payment/mastercard.png" alt="Mastercard" className="h-8" />
                <img src="/images/payment/jcb.png" alt="JCB" className="h-8" />
            </div>

            <p className="text-xs text-gray-500 text-center">
                Thanh toán an toàn với Stripe - Chúng tôi không lưu trữ thông tin thẻ của bạn
            </p>
        </form>
    );
};

export default CheckoutForm;