import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js'
import error from '../assets/error.png'
import success from '../assets/success.png'
import { Link, useNavigate } from 'react-router-dom';
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
    const [loader, setLoader] = useState(true)
    const [stripe, setStripe] = useState('')
    const [message, setMessage] = useState(null)

    useEffect(() => {
        if (!stripe) {
            return
        }
        const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret')
        if (!clientSecret) {
            return
        }
        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            switch(paymentIntent.status){
                case "succeeded":
                    setMessage('succeeded')
                    break
                case "processing":
                    setMessage('processing')
                    break
                case "requires_payment_method":
                    setMessage('failed')
                    break
                default:
                    setMessage('failed')
            }
        }).catch(error => {
            console.error('Payment intent retrieval error:', error);
            setMessage('failed');
            toast.error('Có lỗi xảy ra khi xác nhận thanh toán');
        })
    },[stripe])

    const get_load = async () => {
        try {
            const tempStripe = await load()
            setStripe(tempStripe)
        } catch (error) {
            console.error('Stripe loading error:', error);
            toast.error('Không thể tải Stripe');
        }
    }
    
    useEffect(() => {
        get_load()
    },[])

    const update_payment = async () => {
        const orderId = localStorage.getItem('orderId')
        if (orderId) {
            try {
                const result = await dispatch(confirm_stripe_payment(orderId)).unwrap();
                localStorage.removeItem('orderId')
                setLoader(false)
                toast.success('Thanh toán thành công!');
                navigate('/dashboard/my-orders');
            } catch (error) {
                console.error('Payment confirmation error:', error);
                toast.error(error.message || 'Có lỗi xảy ra khi xác nhận thanh toán');
                setLoader(false);
            }
        }
    }

    useEffect(() => {
        if (message === 'succeeded') {
            update_payment()
        }
    },[message])

    return (
        <div className='w-screen h-screen flex justify-center items-center flex-col gap-4'>
            {
                (message === 'failed' || message === 'processing') ? <>
                <img src={error} alt="" />
                <Link className='px-5 py-2 bg-green-500 rounded-sm text-white' to="/dashboard/my-orders">Back to Dashboard </Link>
                </> : message === 'succeeded' ? loader ? <FadeLoader/> : <>
                <img src={success} alt="" />
                <Link className='px-5 py-2 bg-green-500 rounded-sm text-white' to="/dashboard/my-orders">Back to Dashboard </Link>
                </> : <FadeLoader/> 
            }
        </div>
    );
};

export default ConfirmOrder;