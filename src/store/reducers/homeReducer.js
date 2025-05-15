import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";


export const get_category = createAsyncThunk(
    'product/get_category',
    async(_, { fulfillWithValue, rejectWithValue }) => {
        try {
            const { data } = await api.get('/home/get-categories');

            // Kiểm tra cấu trúc dữ liệu trả về
            if (!data || !data.categories) {
                return rejectWithValue('Dữ liệu không hợp lệ');
            }

            return fulfillWithValue({
                categorys: data.categories // Chuẩn hóa tên trường
            });
        } catch (error) {
            // Sửa lỗi chính tả error.respone -> error.response
            console.log(error.response?.data || error.message);
            return rejectWithValue(error.response?.data || 'Lỗi mạng');
        }
    }
);
export const get_products = createAsyncThunk(
    'product/get_products',
    async(_, { fulfillWithValue, rejectWithValue }) => {
        try {
            const {data} = await api.get('/home/get-products')
            console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            console.log(error.response?.data || error.message)
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi tải sản phẩm' })
        }
    }
)
// End Method 


export const price_range_product = createAsyncThunk(
    'product/price_range_product',
    async(_, { fulfillWithValue, rejectWithValue }) => {
        try {
            const {data} = await api.get('/home/price-range-latest-product')
            console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            console.log(error.response?.data || error.message)
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi tải thông tin giá sản phẩm' })
        }
    }
)
// End Method 

export const query_products = createAsyncThunk(
    'product/query_products',
    async(query, { fulfillWithValue, rejectWithValue }) => {
        try {
            const {data} = await api.get(`/home/query-products?category=${query.category}&&rating=${query.rating}&&lowPrice=${query.low}&&highPrice=${query.high}&&sortPrice=${query.sortPrice}&&pageNumber=${query.pageNumber}&&searchValue=${query.searchValue ? query.searchValue : ''} `)
            return fulfillWithValue(data)
        } catch (error) {
            console.log(error.response?.data || error.message)
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi tìm kiếm sản phẩm' })
        }
    }
)
// End Method 

export const product_details = createAsyncThunk(
    'product/product_details',
    async(slug, { fulfillWithValue, rejectWithValue }) => {
        try {
            const {data} = await api.get(`/home/product-details/${slug}`)
            if (!data || !data.product) {
                return rejectWithValue({ message: "Không tìm thấy sản phẩm" })
            }
            return fulfillWithValue(data)
        } catch (error) {
            console.log('Error:', error.response?.data || error.message)
            return rejectWithValue(error.response?.data || { message: "Lỗi khi tải thông tin sản phẩm" })
        }
    }
)
// End Method 

export const customer_review = createAsyncThunk(
    'review/customer_review',
    async(info, { fulfillWithValue, rejectWithValue }) => {
        try {
            if (!info || !info.rating) {
                return rejectWithValue({ message: 'Vui lòng nhập đầy đủ thông tin đánh giá' });
            }
            
            const {data} = await api.post('/home/customer/submit-review', info);
            return fulfillWithValue(data);
        } catch (error) {
            console.log(error.response?.data || error.message);
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi gửi đánh giá' });
        }
    }
)
// End Method 


export const get_reviews = createAsyncThunk(
    'review/get_reviews',
    async({productId, pageNumber}, { fulfillWithValue, rejectWithValue }) => {
        try {
            const {data} = await api.get(`/home/customer/get-reviews/${productId}?pageNo=${pageNumber}`)
            return fulfillWithValue(data)
        } catch (error) {
            console.log(error.response?.data || error.message)
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi tải đánh giá' })
        }
    }
)
// End Method 


export const get_banners = createAsyncThunk(
    'banner/get_banners',
    async( _ , { fulfillWithValue, rejectWithValue }) => {
        try {
            const {data} = await api.get(`/banners`)
            return fulfillWithValue(data)
        } catch (error) {
            console.log(error.response?.data || error.message)
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi tải banner' })
        }
    }
)
// End Method 




export const homeReducer = createSlice({
    name: 'home',
    initialState:{
        categorys : [],
        products : [],
        totalProduct : 0,
        parPage: 3,
        latest_product : [],
        topRated_product : [],
        discount_product : [],
        priceRange : {
            low: 0,
            high: 100
        },
        product: {},
        relatedProducts: [],
        moreProducts: [],
        errorMessage : '',
        successMessage: '',
        totalReview: 0,
        rating_review: [],
        reviews : [],
        banners: [] 
    },
    reducers : {

        messageClear : (state,_) => {
            state.errorMessage = ""
            state.successMessage = ""
        }
 
    },
    extraReducers: (builder) => {
        builder
        .addCase(get_category.fulfilled, (state, { payload }) => {
            state.categorys = payload?.categorys || []; // Sử dụng optional chaining
        })
        .addCase(get_category.rejected, (state, { payload }) => {
            state.errorMessage = payload || 'Lỗi khi tải danh mục';
            state.categorys = []; // Đặt lại giá trị mặc định
        })
        .addCase(get_products.fulfilled, (state, { payload }) => {
            if (!payload) {
                state.products = [];
                state.latest_product = [];
                state.topRated_product = [];
                state.discount_product = [];
                return;
            }
            state.products = payload.products || [];
            state.latest_product = payload.latest_product || [];
            state.topRated_product = payload.topRated_product || [];
            state.discount_product = payload.discount_product || [];
        })
        .addCase(get_products.rejected, (state, { payload }) => {
            state.errorMessage = payload?.message || 'Lỗi khi tải sản phẩm';
            state.products = [];
            state.latest_product = [];
            state.topRated_product = [];
            state.discount_product = [];
        })
        .addCase(price_range_product.fulfilled, (state, { payload }) => { 
            if (!payload) {
                state.latest_product = [];
                state.priceRange = { low: 0, high: 100 };
                return;
            }
            state.latest_product = payload.latest_product || [];
            state.priceRange = payload.priceRange || { low: 0, high: 100 }; 
        })
        .addCase(price_range_product.rejected, (state, { payload }) => {
            state.errorMessage = payload?.message || 'Lỗi khi tải phạm vi giá';
            state.latest_product = [];
        })
        .addCase(query_products.fulfilled, (state, { payload }) => { 
            if (!payload) {
                state.products = [];
                state.totalProduct = 0;
                state.parPage = 12;
                return;
            }
            state.products = payload.products || [];
            state.totalProduct = payload.totalProduct || 0;
            state.parPage = payload.parPage || 12; 
        })
        .addCase(query_products.rejected, (state, { payload }) => {
            state.errorMessage = payload?.message || 'Lỗi khi tìm kiếm sản phẩm';
            state.products = [];
            state.totalProduct = 0;
        })
        .addCase(product_details.fulfilled, (state, { payload }) => { 
            if (payload?.product) {
                state.product = payload.product;
                state.relatedProducts = payload.relatedProducts || [];
                state.moreProducts = payload.moreProducts || [];
                state.errorMessage = '';
            } else {
                state.product = null;
                state.relatedProducts = [];
                state.moreProducts = [];
                state.errorMessage = "Không tìm thấy sản phẩm";
            }
        })
        .addCase(product_details.rejected, (state, { payload }) => {
            state.product = null;
            state.relatedProducts = [];
            state.moreProducts = [];
            state.errorMessage = payload?.message || "Không tìm thấy sản phẩm";
        })
        .addCase(customer_review.fulfilled, (state, { payload }) => {
            state.successMessage = payload.message;
        })
        .addCase(customer_review.rejected, (state, { payload }) => {
            state.errorMessage = payload?.message || 'Lỗi khi gửi đánh giá';
        })
        .addCase(get_reviews.fulfilled, (state, { payload }) => {
            if (!payload) {
                state.reviews = [];
                state.totalReview = 0;
                state.rating_review = [];
                return;
            }
            state.reviews = payload.reviews || [];
            state.totalReview = payload.totalReview || 0;
            state.rating_review = payload.rating_review || [];
        })
        .addCase(get_reviews.rejected, (state, { payload }) => {
            state.errorMessage = payload?.message || 'Lỗi khi tải đánh giá';
            state.reviews = [];
            state.totalReview = 0;
            state.rating_review = [];
        })
        .addCase(get_banners.fulfilled, (state, { payload }) => {
            if (!payload) {
                state.banners = [];
                return;
            }
            state.banners = payload.banners || []; 
        })
        .addCase(get_banners.rejected, (state, { payload }) => {
            state.errorMessage = payload?.message || 'Lỗi khi tải banner';
            state.banners = [];
        })
    }
})
export const {messageClear} = homeReducer.actions
export default homeReducer.reducer