import React, { createContext, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const StripeContext = createContext();

export const StripeProvider = ({ children }) => {
    return (
        <StripeContext.Provider value={stripePromise}>
            <Elements stripe={stripePromise}>
                {children}
            </Elements>
        </StripeContext.Provider>
    );
};

export const useStripe = () => {
    const stripe = useContext(StripeContext);
    if (!stripe) {
        throw new Error('useStripe must be used within a StripeProvider');
    }
    return stripe;
};

export default StripeContext; 