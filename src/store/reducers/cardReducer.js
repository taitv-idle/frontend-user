import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api"; 

// Thêm sản phẩm vào giỏ hàng
export const add_to_card = createAsyncThunk(
    'card/add_to_card',
    async (info, { rejectWithValue }) => {
        try {
            const response = await api.post('/home/product/add-to-card', info);
            return response.data;
        } catch (error) {
            console.log('Error response:', error);
            // Trả về trực tiếp error vì nó đã được xử lý bởi api interceptor
            return rejectWithValue(error);
        }
    }
);

// Lấy danh sách sản phẩm trong giỏ hàng
export const get_card_products = createAsyncThunk(
    'card/get_card_products',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/home/product/get-card-product/${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// Xóa sản phẩm khỏi giỏ hàng
export const delete_card_product = createAsyncThunk(
    'card/delete_card_product',
    async (card_id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/home/product/delete-card-product/${card_id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// Tăng số lượng sản phẩm
export const quantity_inc = createAsyncThunk(
    'card/quantity_inc',
    async (card_id, { rejectWithValue }) => {
        try {
            const response = await api.put(`/home/product/quantity-inc/${card_id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// Giảm số lượng sản phẩm
export const quantity_dec = createAsyncThunk(
    'card/quantity_dec',
    async (card_id, { rejectWithValue }) => {
        try {
            const response = await api.put(`/home/product/quantity-dec/${card_id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// Wishlist actions
export const add_to_wishlist = createAsyncThunk(
    'wishlist/add_to_wishlist',
    async (info, { rejectWithValue }) => {
        try {
            const response = await api.post('/home/product/add-to-wishlist', info);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const get_wishlist_products = createAsyncThunk(
    'wishlist/get_wishlist_products',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/home/product/get-wishlist-products/${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const remove_wishlist = createAsyncThunk(
    'wishlist/remove_wishlist',
    async (wishlistId, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/home/product/remove-wishlist-product/${wishlistId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// Xóa toàn bộ giỏ hàng
export const clear_cart = createAsyncThunk(
    'card/clear_cart',
    async (userId, { rejectWithValue, dispatch, getState }) => {
        try {
            // Lấy danh sách sản phẩm trong giỏ hàng
            const cartResponse = await api.get(`/home/product/get-card-product/${userId}`);
            
            if (!cartResponse.data.success) {
                return rejectWithValue({ message: 'Không thể lấy danh sách giỏ hàng' });
            }
            
            const cardProducts = cartResponse.data.data.card_products;
            
            // Nếu giỏ hàng trống, trả về thành công luôn
            if (!cardProducts || cardProducts.length === 0) {
                return {
                    success: true,
                    message: 'Giỏ hàng đã trống'
                };
            }
            
            // Danh sách các ID sản phẩm cần xóa
            const cartItemIds = [];
            
            // Thu thập tất cả ID sản phẩm từ các cửa hàng
            cardProducts.forEach(shop => {
                shop.products.forEach(product => {
                    cartItemIds.push(product._id);
                });
            });
            
            console.log('Xóa các sản phẩm từ giỏ hàng:', cartItemIds);
            
            // Xóa từng sản phẩm trong giỏ hàng
            const deletePromises = cartItemIds.map(cardId => 
                api.delete(`/home/product/delete-card-product/${cardId}`)
            );
            
            await Promise.all(deletePromises);
            
            return {
                success: true,
                message: 'Giỏ hàng đã được xóa thành công'
            };
        } catch (error) {
            console.error('Error clearing cart:', error);
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi xóa giỏ hàng' });
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
        loading: false,
        summary: {
            totalPrice: 0,
            totalItems: 0,
            shippingFee: 0,
            outOfStockCount: 0,
            buyableItems: 0
        }
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
                if (payload.data?.product) {
                    state.card_product_count = (state.card_product_count || 0) + 1;
                }
            })
            .addCase(add_to_card.rejected, (state, { payload }) => {
                console.log('Add to cart rejected payload:', payload);
                state.loading = false;
                state.errorMessage = payload?.message;
            })

            // Get cart products
            .addCase(get_card_products.fulfilled, (state, { payload }) => {
                if (payload.success) {
                    state.card_products = payload.data.card_products || [];
                    state.summary = payload.data.summary || {
                        totalPrice: 0,
                        totalItems: 0,
                        shippingFee: 0,
                        outOfStockCount: 0,
                        buyableItems: 0
                    };
                    state.outofstock_products = payload.data.outOfStockProducts || [];
                    state.card_product_count = state.summary.totalItems;
                    state.buy_product_item = state.summary.buyableItems;
                    state.price = state.summary.totalPrice;
                    state.shipping_fee = state.summary.shippingFee;
                    state.errorMessage = '';
                } else {
                    state.errorMessage = payload.message;
                }
            })
            .addCase(get_card_products.rejected, (state, { payload }) => {
                state.errorMessage = payload?.message;
            })

            // Delete cart product
            .addCase(delete_card_product.fulfilled, (state, { payload }) => {
                if (payload.success) {
                    state.successMessage = payload.message;
                    state.card_product_count = Math.max(0, state.card_product_count - 1);
                } else {
                    state.errorMessage = payload.message;
                }
            })

            // Quantity increase
            .addCase(quantity_inc.pending, (state, { meta }) => {
                const card_id = meta.arg;
                state.card_products = state.card_products.map(shop => ({
                    ...shop,
                    products: shop.products.map(p => 
                        p._id === card_id 
                            ? { ...p, quantity: p.quantity + 1 } 
                            : p
                    )
                }));
            })
            .addCase(quantity_inc.fulfilled, (state, { payload }) => {
                if (payload.success) {
                    state.successMessage = payload.message;
                    if (payload.data?.updatedProduct) {
                        state.card_products = state.card_products.map(shop => ({
                            ...shop,
                            products: shop.products.map(p => 
                                p._id === payload.data.updatedProduct._id 
                                    ? payload.data.updatedProduct 
                                    : p
                            )
                        }));
                    }
                } else {
                    state.errorMessage = payload.message;
                }
            })
            .addCase(quantity_inc.rejected, (state, { payload }) => {
                state.errorMessage = payload?.message;
            })

            // Quantity decrease
            .addCase(quantity_dec.pending, (state, { meta }) => {
                const card_id = meta.arg;
                state.card_products = state.card_products.map(shop => ({
                    ...shop,
                    products: shop.products.map(p => 
                        p._id === card_id && p.quantity > 1
                            ? { ...p, quantity: p.quantity - 1 } 
                            : p
                    )
                }));
            })
            .addCase(quantity_dec.fulfilled, (state, { payload }) => {
                if (payload.success) {
                    state.successMessage = payload.message;
                    if (payload.data?.updatedProduct) {
                        state.card_products = state.card_products.map(shop => ({
                            ...shop,
                            products: shop.products.map(p => 
                                p._id === payload.data.updatedProduct._id 
                                    ? payload.data.updatedProduct 
                                    : p
                            )
                        }));
                    }
                } else {
                    state.errorMessage = payload.message;
                }
            })
            .addCase(quantity_dec.rejected, (state, { payload }) => {
                state.errorMessage = payload?.message;
            })

            // Wishlist actions
            .addCase(add_to_wishlist.rejected, (state, { payload }) => {
                state.errorMessage = payload?.message;
            })
            .addCase(add_to_wishlist.fulfilled, (state, { payload }) => {
                if (payload.success) {
                    state.successMessage = payload.message;
                    state.wishlist_count = (state.wishlist_count || 0) + 1;
                } else {
                    state.errorMessage = payload.message;
                }
            })
            .addCase(get_wishlist_products.fulfilled, (state, { payload }) => {
                if (payload.success) {
                    state.wishlist = payload.data.wishlists || [];
                    state.wishlist_count = payload.data.wishlistCount || 0;
                } else {
                    state.errorMessage = payload.message;
                }
            })
            .addCase(remove_wishlist.fulfilled, (state, { payload }) => {
                if (payload.success) {
                    state.successMessage = payload.message;
                    state.wishlist = state.wishlist.filter(p => p._id !== payload.data.deletedWishlistId);
                    state.wishlist_count = Math.max(0, state.wishlist_count - 1);
                } else {
                    state.errorMessage = payload.message;
                }
            })

            // Clear cart
            .addCase(clear_cart.pending, (state) => {
                state.loading = true;
                state.errorMessage = '';
            })
            .addCase(clear_cart.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.card_products = [];
                state.card_product_count = 0;
                state.price = 0;
                state.shipping_fee = 0;
                state.successMessage = payload.message || 'Giỏ hàng đã được xóa';
            })
            .addCase(clear_cart.rejected, (state, { payload }) => {
                state.loading = false;
                state.errorMessage = payload?.message || 'Lỗi khi xóa giỏ hàng';
            });
    }
});

export const { messageClear, reset_count } = cardReducer.actions;
export default cardReducer.reducer;
