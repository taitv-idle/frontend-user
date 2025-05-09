import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
import axios from "axios";

export const place_order = createAsyncThunk(
    'order/place_order',
    async ({ shippingInfo, orderItems, itemsPrice, taxPrice, shippingPrice, totalPrice, userId, navigate, paymentMethod }, { rejectWithValue }) => {
        try {
            // Kiểm tra chi tiết các trường bắt buộc
            const missingFields = [];
            
            if (!shippingInfo) missingFields.push('Thông tin giao hàng');
            else {
                if (!shippingInfo.name) missingFields.push('Tên người nhận');
                if (!shippingInfo.phone) missingFields.push('Số điện thoại');
                if (!shippingInfo.address) missingFields.push('Địa chỉ');
                if (!shippingInfo.province) missingFields.push('Tỉnh/Thành phố');
                if (!shippingInfo.city) missingFields.push('Quận/Huyện');
                if (!shippingInfo.area) missingFields.push('Phường/Xã');
            }

            if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
                missingFields.push('Sản phẩm đặt hàng');
            }

            if (!itemsPrice || itemsPrice <= 0) {
                missingFields.push('Giá sản phẩm');
            }

            if (!userId) {
                missingFields.push('Thông tin người dùng');
            }

            if (missingFields.length > 0) {
                console.log('Missing required fields:', missingFields);
                return rejectWithValue({ 
                    message: `Thiếu thông tin bắt buộc: ${missingFields.join(', ')}` 
                });
            }

            // Chuẩn bị dữ liệu gửi lên server
            const orderData = {
                shippingInfo,
                products: orderItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    discount: item.discount,
                    shopId: item.shopId
                })),
                price: itemsPrice,
                taxPrice: taxPrice || 0,
                shippingPrice,
                totalPrice,
                userId,
                paymentMethod: paymentMethod || 'cod',
                paymentStatus: paymentMethod === 'cod' ? 'pending' : 'unpaid'
            };

            console.log('Sending order data to server:', JSON.stringify(orderData, null, 2));

            try {
                // Gọi API tạo đơn hàng
                const response = await api.post('/home/order/place-order', orderData);
                const data = response.data;

                console.log('Server response:', data);

                // Kiểm tra response
                if (!data || !data.orderId) {
                    return rejectWithValue({ 
                        message: 'Không nhận được thông tin đơn hàng từ server' 
                    });
                }

                // Chuẩn bị dữ liệu cho trang xác nhận
                const confirmationData = {
                    orderId: data.orderId,
                    paymentMethod: paymentMethod || 'cod',
                    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'unpaid',
                    orderDetails: {
                        shippingInfo: {
                            name: shippingInfo.name,
                            phone: shippingInfo.phone,
                            address: shippingInfo.address,
                            area: shippingInfo.area,
                            city: shippingInfo.city,
                            province: shippingInfo.province
                        },
                        orderItems: orderItems.map(item => ({
                            productId: item.productId,
                            name: item.name || 'Sản phẩm',
                            image: item.image || 'https://via.placeholder.com/150',
                            quantity: item.quantity,
                            price: item.price,
                            discount: item.discount,
                            shopId: item.shopId
                        })),
                        itemsPrice,
                        taxPrice: taxPrice || 0,
                        shippingPrice,
                        totalPrice,
                        orderId: data.orderId
                    }
                };

                console.log('Confirmation data:', JSON.stringify(confirmationData, null, 2));

                // Chuyển hướng đến trang xác nhận
                navigate('/order-confirmation', {
                    state: confirmationData
                });

                return confirmationData;
            } catch (apiError) {
                console.error('API Error:', apiError);
                if (apiError.response) {
                    // Server trả về lỗi
                    return rejectWithValue(apiError.response.data || { 
                        message: 'Lỗi server khi tạo đơn hàng' 
                    });
                } else if (apiError.request) {
                    // Không nhận được response
                    return rejectWithValue({ 
                        message: 'Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng.' 
                    });
                } else {
                    // Lỗi khác
                    return rejectWithValue({ 
                        message: apiError.message || 'Có lỗi xảy ra khi tạo đơn hàng' 
                    });
                }
            }
        } catch (error) {
            console.error('Order error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });

            return rejectWithValue({ 
                message: error.message || 'Có lỗi xảy ra khi tạo đơn hàng' 
            });
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
    async ({ status, customerId }, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/home/coustomer/get-orders/${customerId}/${status}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const get_order_details = createAsyncThunk(
    'order/get_order_details',
    async (orderId, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/home/coustomer/get-order-details/${orderId}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Lấy danh sách tỉnh/thành phố
export const get_provinces = createAsyncThunk(
    'order/get_provinces',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('https://provinces.open-api.vn/api/p/');
            return response.data;
        } catch (error) {
            return rejectWithValue({ message: 'Lỗi khi tải danh sách tỉnh/thành phố' });
        }
    }
);

// Lấy danh sách quận/huyện
export const get_districts = createAsyncThunk(
    'order/get_districts',
    async (provinceCode, { rejectWithValue }) => {
        try {
            const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            return response.data.districts;
        } catch (error) {
            return rejectWithValue({ message: 'Lỗi khi tải danh sách quận/huyện' });
        }
    }
);

// Lấy danh sách phường/xã
export const get_wards = createAsyncThunk(
    'order/get_wards',
    async (districtCode, { rejectWithValue }) => {
        try {
            const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            return response.data.wards;
        } catch (error) {
            return rejectWithValue({ message: 'Lỗi khi tải danh sách phường/xã' });
        }
    }
);

// Tính phí vận chuyển
export const calculate_shipping_fee = createAsyncThunk(
    'order/calculate_shipping_fee',
    async (price, { rejectWithValue }) => {
        try {
            // Nếu đơn hàng trên 500k thì miễn phí vận chuyển
            // Nếu không thì phí vận chuyển là 40k
            const fee = price >= 500 ? 0 : 40;
            const isFree = fee === 0;

            return {
                fee,
                isFree,
                price
            };
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Lưu địa chỉ giao hàng
export const save_shipping_address = createAsyncThunk(
    'order/save_shipping_address',
    async (addressData, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/order/save-address', addressData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Lấy danh sách địa chỉ đã lưu
export const get_saved_addresses = createAsyncThunk(
    'order/get_saved_addresses',
    async (userId, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/order/saved-addresses/${userId}`);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Cập nhật địa chỉ
export const update_address = createAsyncThunk(
    'order/update_address',
    async ({ addressId, addressData }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/order/address/${addressId}`, addressData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Xóa địa chỉ
export const delete_address = createAsyncThunk(
    'order/delete_address',
    async (addressId, { rejectWithValue }) => {
        try {
            const { data } = await api.delete(`/order/address/${addressId}`);
            return { data, addressId };
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Đặt địa chỉ làm mặc định
export const set_default_address = createAsyncThunk(
    'order/set_default_address',
    async (addressId, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/order/address/${addressId}/default`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const update_payment_status = createAsyncThunk(
    'order/update_payment_status',
    async ({ orderId, paymentStatus, paymentMethod }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/order/update-payment-status/${orderId}`, {
                paymentStatus,
                paymentMethod
            });
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const create_payment_intent = createAsyncThunk(
    'order/create_payment_intent',
    async ({ price, orderId }, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/home/order/create-payment-intent', {
                price,
                orderId
            });
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const get_customer_dashboard_data = createAsyncThunk(
    'order/get_customer_dashboard_data',
    async (userId, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/home/customer/dashboard/${userId}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const orderReducer = createSlice({
    name: 'order',
    initialState: {
        myOrders: [],
        errorMessage: '',
        successMessage: '',
        myOrder: {},
        loading: false,
        paymentStatus: 'idle',
        provinces: [],
        districts: [],
        wards: [],
        savedAddresses: [],
        shippingFee: 0,
        addressLoading: false,
        addressError: null,
        isFreeShipping: false,
        currentOrder: null,
        dashboardData: null,
        paymentIntent: null,
    },
    reducers: {
        messageClear: (state) => {
            state.errorMessage = "";
            state.successMessage = "";
            state.addressError = null;
        },
        resetPaymentStatus: (state) => {
            state.paymentStatus = 'idle';
        },
        clearLocationData: (state) => {
            state.districts = [];
            state.wards = [];
            state.addressError = null;
        },
        setCurrentOrder: (state, action) => {
            state.currentOrder = action.payload;
            state.loading = false;
        },
        clearPaymentIntent: (state) => {
            state.paymentIntent = null;
        },
        clear_order_error: (state) => {
            state.errorMessage = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(place_order.pending, (state) => {
                state.loading = true;
                state.errorMessage = '';
                state.successMessage = '';
            })
            .addCase(place_order.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.currentOrder = payload;
                state.paymentStatus = payload.paymentMethod === 'cod' ? 'pending' : 'unpaid';
                // Không hiển thị thông báo ở đây vì đã chuyển hướng
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
            })
            .addCase(get_provinces.pending, (state) => {
                state.addressLoading = true;
                state.addressError = null;
            })
            .addCase(get_provinces.fulfilled, (state, { payload }) => {
                state.addressLoading = false;
                state.provinces = Array.isArray(payload) ? payload : [];
                state.addressError = null;
            })
            .addCase(get_provinces.rejected, (state, { payload }) => {
                state.addressLoading = false;
                state.addressError = payload?.message || "Lỗi khi tải danh sách tỉnh/thành phố";
                state.errorMessage = state.addressError;
            })
            .addCase(get_districts.pending, (state) => {
                state.addressLoading = true;
                state.addressError = null;
            })
            .addCase(get_districts.fulfilled, (state, { payload }) => {
                state.addressLoading = false;
                state.districts = Array.isArray(payload) ? payload : [];
                state.addressError = null;
            })
            .addCase(get_districts.rejected, (state, { payload }) => {
                state.addressLoading = false;
                state.addressError = payload?.message || "Lỗi khi tải danh sách quận/huyện";
                state.errorMessage = state.addressError;
            })
            .addCase(get_wards.pending, (state) => {
                state.addressLoading = true;
                state.addressError = null;
            })
            .addCase(get_wards.fulfilled, (state, { payload }) => {
                state.addressLoading = false;
                state.wards = Array.isArray(payload) ? payload : [];
                state.addressError = null;
            })
            .addCase(get_wards.rejected, (state, { payload }) => {
                state.addressLoading = false;
                state.addressError = payload?.message || "Lỗi khi tải danh sách phường/xã";
                state.errorMessage = state.addressError;
            })
            .addCase(calculate_shipping_fee.pending, (state) => {
                state.addressLoading = true;
            })
            .addCase(calculate_shipping_fee.fulfilled, (state, { payload }) => {
                state.addressLoading = false;
                state.shippingFee = payload.fee;
                state.isFreeShipping = payload.isFree;
            })
            .addCase(calculate_shipping_fee.rejected, (state, { payload }) => {
                state.addressLoading = false;
                state.errorMessage = payload?.message || "Lỗi khi tính phí vận chuyển";
            })
            .addCase(get_saved_addresses.pending, (state) => {
                state.addressLoading = true;
            })
            .addCase(get_saved_addresses.fulfilled, (state, { payload }) => {
                state.addressLoading = false;
                state.savedAddresses = Array.isArray(payload) ? payload : [];
                state.addressError = null;
            })
            .addCase(get_saved_addresses.rejected, (state, { payload }) => {
                state.addressLoading = false;
                state.errorMessage = payload?.message || "Lỗi khi tải địa chỉ đã lưu";
            })
            .addCase(save_shipping_address.pending, (state) => {
                state.addressLoading = true;
            })
            .addCase(save_shipping_address.fulfilled, (state, { payload }) => {
                state.addressLoading = false;
                state.successMessage = payload.message;
                state.savedAddresses = [...state.savedAddresses, payload.address];
            })
            .addCase(save_shipping_address.rejected, (state, { payload }) => {
                state.addressLoading = false;
                state.errorMessage = payload?.message || "Lỗi khi lưu địa chỉ";
            })
            .addCase(update_address.pending, (state) => {
                state.addressLoading = true;
            })
            .addCase(update_address.fulfilled, (state, { payload }) => {
                state.addressLoading = false;
                state.successMessage = payload.message;
                state.savedAddresses = state.savedAddresses.map(address => 
                    address._id === payload.address._id ? payload.address : address
                );
            })
            .addCase(update_address.rejected, (state, { payload }) => {
                state.addressLoading = false;
                state.errorMessage = payload?.message || "Lỗi khi cập nhật địa chỉ";
            })
            .addCase(delete_address.pending, (state) => {
                state.addressLoading = true;
            })
            .addCase(delete_address.fulfilled, (state, { payload }) => {
                state.addressLoading = false;
                state.successMessage = payload.data.message;
                state.savedAddresses = state.savedAddresses.filter(address => 
                    address._id !== payload.addressId
                );
            })
            .addCase(delete_address.rejected, (state, { payload }) => {
                state.addressLoading = false;
                state.errorMessage = payload?.message || "Lỗi khi xóa địa chỉ";
            })
            .addCase(set_default_address.pending, (state) => {
                state.addressLoading = true;
            })
            .addCase(set_default_address.fulfilled, (state, { payload }) => {
                state.addressLoading = false;
                state.successMessage = payload.message;
                state.savedAddresses = state.savedAddresses.map(address => ({
                    ...address,
                    isDefault: address._id === payload.address._id
                }));
            })
            .addCase(set_default_address.rejected, (state, { payload }) => {
                state.addressLoading = false;
                state.errorMessage = payload?.message || "Lỗi khi đặt địa chỉ mặc định";
            })
            .addCase(update_payment_status.pending, (state) => {
                state.paymentStatus = 'processing';
            })
            .addCase(update_payment_status.fulfilled, (state, { payload }) => {
                state.paymentStatus = payload.paymentStatus;
                state.successMessage = payload.paymentStatus === 'paid' 
                    ? "Thanh toán thành công" 
                    : "Cập nhật trạng thái thanh toán thành công";
            })
            .addCase(update_payment_status.rejected, (state, { payload }) => {
                state.paymentStatus = 'failed';
                state.errorMessage = payload?.message || "Cập nhật trạng thái thanh toán thất bại";
            })
            .addCase(create_payment_intent.pending, (state) => {
                state.loading = true;
            })
            .addCase(create_payment_intent.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.paymentIntent = payload;
            })
            .addCase(create_payment_intent.rejected, (state, { payload }) => {
                state.loading = false;
                state.errorMessage = payload?.message || "Lỗi khi tạo payment intent";
            })
            .addCase(get_customer_dashboard_data.pending, (state) => {
                state.loading = true;
            })
            .addCase(get_customer_dashboard_data.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.dashboardData = payload;
            })
            .addCase(get_customer_dashboard_data.rejected, (state, { payload }) => {
                state.loading = false;
                state.errorMessage = payload?.message || "Lỗi khi lấy dữ liệu dashboard";
            })
            .addCase(get_orders.pending, (state) => {
                state.loading = true;
                state.errorMessage = '';
            })
            .addCase(get_orders.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.myOrders = payload.orders || [];
                state.errorMessage = '';
            })
            .addCase(get_orders.rejected, (state, { payload }) => {
                state.loading = false;
                state.errorMessage = payload?.message || 'Lỗi khi lấy danh sách đơn hàng';
            })
            .addCase(get_order_details.pending, (state) => {
                state.loading = true;
                state.errorMessage = '';
            })
            .addCase(get_order_details.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.myOrder = payload.order || {};
                state.errorMessage = '';
            })
            .addCase(get_order_details.rejected, (state, { payload }) => {
                state.loading = false;
                state.errorMessage = payload?.message || 'Lỗi khi lấy thông tin đơn hàng';
            });
    }
});

export const { messageClear, resetPaymentStatus, clearLocationData, setCurrentOrder, clearPaymentIntent, clear_order_error } = orderReducer.actions;
export default orderReducer.reducer;