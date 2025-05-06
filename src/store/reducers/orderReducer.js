import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const place_order = createAsyncThunk(
    'order/place_order',
    async ({ price, products, shipping_fee, items, shippingInfo, userId, navigate, paymentMethod }, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/order/place-order', {
                price,
                products,
                shipping_fee,
                items,
                shippingInfo,
                userId,
                paymentMethod
            });

            if (paymentMethod === 'cod') {
                navigate('/order-confirmation', {
                    state: {
                        orderId: data.orderId,
                        paymentMethod: 'cod'
                    }
                });
            } else {
                navigate('/payment', {
                    state: {
                        price: price + shipping_fee,
                        items,
                        orderId: data.orderId
                    }
                });
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const confirm_cod_payment = createAsyncThunk(
    'order/confirm_cod',
    async (orderId, { rejectWithValue }) => {
        try {
            const { data } = await api.patch(`/home/order/confirm-cod/${orderId}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const confirm_stripe_payment = createAsyncThunk(
    'order/confirm_stripe',
    async (orderId, { rejectWithValue }) => {
        try {
            const { data } = await api.patch(`/home/order/confirm-stripe/${orderId}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const get_orders = createAsyncThunk(
    'order/get_orders',
    async({customerId,status}, { rejectWithValue,fulfillWithValue }) => {
        try {
            const {data} = await api.get(`/home/coustomer/get-orders/${customerId}/${status}`)
            // console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)
// End Method

export const get_order_details = createAsyncThunk(
    'order/get_order_details',
    async(orderId , { rejectWithValue,fulfillWithValue }) => {
        try {
            const {data} = await api.get(`/home/coustomer/get-order-details/${orderId}`)
            // console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)
// End Method


const orderReducer = createSlice({
    name: 'order',
    initialState: {
        myOrders: [],
        errorMessage: '',
        successMessage: '',
        myOrder: {},
        loading: false,
        paymentStatus: 'idle' // 'idle' | 'processing' | 'succeeded' | 'failed'
    },
    reducers: {
        messageClear: (state) => {
            state.errorMessage = "";
            state.successMessage = "";
        },
        resetPaymentStatus: (state) => {
            state.paymentStatus = 'idle';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(place_order.pending, (state) => {
                state.loading = true;
            })
            .addCase(place_order.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.successMessage = payload.message;
            })
            .addCase(place_order.rejected, (state, { payload }) => {
                state.loading = false;
                state.errorMessage = payload?.message || "Đặt hàng thất bại";
            })
            .addCase(confirm_cod_payment.pending, (state) => {
                state.paymentStatus = 'processing';
            })
            .addCase(confirm_cod_payment.fulfilled, (state) => {
                state.paymentStatus = 'succeeded';
                state.successMessage = "Xác nhận COD thành công";
            })
            .addCase(confirm_cod_payment.rejected, (state, { payload }) => {
                state.paymentStatus = 'failed';
                state.errorMessage = payload?.message || "Xác nhận COD thất bại";
            })
            .addCase(confirm_stripe_payment.pending, (state) => {
                state.paymentStatus = 'processing';
            })
            .addCase(confirm_stripe_payment.fulfilled, (state) => {
                state.paymentStatus = 'succeeded';
                state.successMessage = "Thanh toán Stripe thành công";
            })
            .addCase(confirm_stripe_payment.rejected, (state, { payload }) => {
                state.paymentStatus = 'failed';
                state.errorMessage = payload?.message || "Thanh toán Stripe thất bại";
            });
    }
});

export const { messageClear, resetPaymentStatus } = orderReducer.actions;
export default orderReducer.reducer;