import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js' 
import { Elements } from '@stripe/react-stripe-js' 
import axios from 'axios';
import CheckoutForm from './CheckoutForm';
import { toast } from 'react-hot-toast';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51Oml5cGAwoXiNtjJgPPyQngDj9WTjawya4zCsqTn3LPFhl4VvLZZJIh9fW9wqVweFYC5f0YEb9zjUqRpXbkEKT7T00eU1xQvjp');

const Stripe = ({ price, orderId }) => {
    const [clientSecret, setClientSecret] = useState('');
    const [error, setError] = useState('');

    const appearance = {
        theme: 'stripe'
    };

    const options = {
        appearance,
        clientSecret
    };

    const create_payment = async () => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/order/create-payment', { price }, { withCredentials: true });
            setClientSecret(data.clientSecret);
        } catch (error) {
            console.error('Payment error:', error);
            setError(error.response?.data?.message || 'Không thể tạo thanh toán');
            toast.error(error.response?.data?.message || 'Không thể tạo thanh toán');
        }
    };

    if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-700">
                    Không thể kết nối với hệ thống thanh toán. Vui lòng thử lại sau.
                </p>
            </div>
        );
    }

    return (
        <div className='mt-4'>
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm mb-4">
                    {error}
                </div>
            )}
            {clientSecret ? (
                <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm orderId={orderId} />
                </Elements>
            ) : (
                <button 
                    onClick={create_payment} 
                    className='px-10 py-[6px] rounded-sm hover:shadow-green-700/30 hover:shadow-lg bg-green-700 text-white'
                >
                    Bắt đầu thanh toán
                </button>
            )}
        </div>
    );
};

export default Stripe;