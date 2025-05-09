import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api"; 

// Thêm sản phẩm vào giỏ hàng
export const add_to_card = createAsyncThunk(
    'card/add_to_card',
    async (info, { rejectWithValue }) => {
        try {
            // Kiểm tra và chuẩn bị dữ liệu
            if (!info.userId || !info.productId) {
                return rejectWithValue({ 
                    message: 'Vui lòng điền đầy đủ thông tin' 
                });
            }

            const requestData = {
                userId: info.userId,
                productId: info.productId,
                quantity: info.quantity || 1
            };

            console.log('Adding to cart:', requestData);
            const response = await api.post('/home/product/add-to-card', requestData);
            console.log('Add to cart response:', response.data);
            
            return response.data;
        } catch (error) {
            console.error('Add to cart error:', error.response?.data || error);
            
            // Xử lý các loại lỗi từ server
            const errorMessages = {
                'Sản phẩm đã có trong giỏ hàng': 'Sản phẩm đã có trong giỏ hàng',
                'Vui lòng điền đầy đủ thông tin': 'Vui lòng điền đầy đủ thông tin',
                'Lỗi máy chủ': 'Có lỗi xảy ra, vui lòng thử lại sau'
            };

            const serverError = error.response?.data?.error;
            if (serverError && errorMessages[serverError]) {
                return rejectWithValue({ message: errorMessages[serverError] });
            }

            return rejectWithValue({ 
                message: error.response?.data?.message || 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng' 
            });
        }
    }
);

// Lấy danh sách sản phẩm trong giỏ hàng
export const get_card_products = createAsyncThunk(
    'card/get_card_products',
    async (userId, { rejectWithValue }) => {
        try {
            if (!userId) {
                return rejectWithValue({ message: 'Vui lòng cung cấp ID người dùng' });
            }

            const response = await api.get(`/home/product/get-card-product/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Get cart products error:', error.response?.data || error);
            return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra khi lấy thông tin giỏ hàng' });
        }
    }
);

// Xóa sản phẩm khỏi giỏ hàng
export const delete_card_product = createAsyncThunk(
    'card/delete_card_product',
    async (card_id, { rejectWithValue }) => {
        try {
            if (!card_id) {
                return rejectWithValue({ message: 'Vui lòng cung cấp ID giỏ hàng' });
            }

            const response = await api.delete(`/home/product/delete-card-product/${card_id}`);
            return response.data;
        } catch (error) {
            console.error('Delete cart product error:', error.response?.data || error);
            return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng' });
        }
    }
);

// Tăng số lượng sản phẩm
export const quantity_inc = createAsyncThunk(
    'card/quantity_inc',
    async (card_id, { rejectWithValue }) => {
        try {
            if (!card_id) {
                return rejectWithValue({ message: 'Vui lòng cung cấp ID giỏ hàng' });
            }

            const response = await api.put(`/home/product/quantity-inc/${card_id}`);
            return response.data;
        } catch (error) {
            console.error('Increase quantity error:', error.response?.data || error);
            return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra khi tăng số lượng sản phẩm' });
        }
    }
);

// Giảm số lượng sản phẩm
export const quantity_dec = createAsyncThunk(
    'card/quantity_dec',
    async (card_id, { rejectWithValue }) => {
        try {
            if (!card_id) {
                return rejectWithValue({ message: 'Vui lòng cung cấp ID giỏ hàng' });
            }

            const response = await api.put(`/home/product/quantity-dec/${card_id}`);
            return response.data;
        } catch (error) {
            console.error('Decrease quantity error:', error.response?.data || error);
            return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra khi giảm số lượng sản phẩm' });
        }
    }
);

// Wishlist actions
export const add_to_wishlist = createAsyncThunk(
    'wishlist/add_to_wishlist',
    async (info, { rejectWithValue }) => {
        try {
            if (!info.slug) {
                return rejectWithValue({ message: 'Vui lòng cung cấp mã sản phẩm' });
            }

            const response = await api.post('/home/product/add-to-wishlist', info);
            return response.data;
        } catch (error) {
            console.error('Add to wishlist error:', error.response?.data || error);
            return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra khi thêm vào danh sách yêu thích' });
        }
    }
);

export const get_wishlist_products = createAsyncThunk(
    'wishlist/get_wishlist_products',
    async (userId, { rejectWithValue }) => {
        try {
            if (!userId) {
                return rejectWithValue({ message: 'Vui lòng cung cấp ID người dùng' });
            }

            const response = await api.get(`/home/product/get-wishlist-products/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Get wishlist error:', error.response?.data || error);
            return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra khi lấy danh sách yêu thích' });
        }
    }
);

export const remove_wishlist = createAsyncThunk(
    'wishlist/remove_wishlist',
    async (wishlistId, { rejectWithValue }) => {
        try {
            if (!wishlistId) {
                return rejectWithValue({ message: 'Vui lòng cung cấp ID danh sách yêu thích' });
            }

            const response = await api.delete(`/home/product/remove-wishlist-product/${wishlistId}`);
            return response.data;
        } catch (error) {
            console.error('Remove wishlist error:', error.response?.data || error);
            return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra khi xóa khỏi danh sách yêu thích' });
        }
    }
);

const cardReducer = createSlice({
    name: 'card',
    initialState: {
        card_products: [],
        card_product_count: 0,
        wishlist_count: 0,
        wishlist: [],
        price: 0,
        errorMessage: '',
        successMessage: '',
        shipping_fee: 0,
        outofstock_products: [],
        buy_product_item: 0,
        loading: false
    },
    reducers: {
        messageClear: (state) => {
            state.errorMessage = "";
            state.successMessage = "";
        },
        reset_count: (state) => {
            state.card_product_count = 0;
            state.wishlist_count = 0;
        }
    },
    extraReducers: (builder) => {
        builder
            // Add to cart
            .addCase(add_to_card.pending, (state) => {
                state.loading = true;
                state.errorMessage = '';
                state.successMessage = '';
            })
            .addCase(add_to_card.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.successMessage = payload.message;
                if (payload.product) {
                    state.card_product_count = (state.card_product_count || 0) + 1;
                }
            })
            .addCase(add_to_card.rejected, (state, { payload }) => {
                state.loading = false;
                state.errorMessage = payload?.message || 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng';
            })

            // Get cart products
            .addCase(get_card_products.fulfilled, (state, { payload }) => {
                state.card_products = payload.card_products || [];
                state.price = payload.price || 0;
                state.card_product_count = payload.card_product_count || 0;
                state.shipping_fee = payload.shipping_fee || 0;
                state.outofstock_products = payload.outOfStockProduct || [];
                state.buy_product_item = payload.buy_product_item || 0;
            })

            // Delete cart product
            .addCase(delete_card_product.fulfilled, (state, { payload }) => {
                state.successMessage = payload.message;
                state.card_product_count = Math.max(0, state.card_product_count - 1);
            })

            // Quantity increase
            .addCase(quantity_inc.fulfilled, (state, { payload }) => {
                state.successMessage = payload.message;
            })

            // Quantity decrease
            .addCase(quantity_dec.fulfilled, (state, { payload }) => {
                state.successMessage = payload.message;
            })

            // Wishlist actions
            .addCase(add_to_wishlist.rejected, (state, { payload }) => {
                state.errorMessage = payload?.message || 'Có lỗi xảy ra khi thêm vào danh sách yêu thích';
            })
            .addCase(add_to_wishlist.fulfilled, (state, { payload }) => {
                state.successMessage = payload.message;
                state.wishlist_count = (state.wishlist_count || 0) + 1;
            })
            .addCase(get_wishlist_products.fulfilled, (state, { payload }) => {
                state.wishlist = payload.wishlists || [];
                state.wishlist_count = payload.wishlistCount || 0;
            })
            .addCase(remove_wishlist.fulfilled, (state, { payload }) => {
                state.successMessage = payload.message;
                state.wishlist = state.wishlist.filter(p => p._id !== payload.wishlistId);
                state.wishlist_count = Math.max(0, state.wishlist_count - 1);
            });
    }
});

export const { messageClear, reset_count } = cardReducer.actions;
export default cardReducer.reducer;