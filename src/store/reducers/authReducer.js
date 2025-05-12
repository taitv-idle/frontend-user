import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
import { jwtDecode } from "jwt-decode";

export const customer_register = createAsyncThunk(
    'auth/customer_register',
    async(info, { rejectWithValue,fulfillWithValue }) => {
        try {
            const {data} = await api.post('/customer/customer-register',info)
            localStorage.setItem('customerToken',data.token)
           // console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)
// End Method 

export const customer_login = createAsyncThunk(
    'auth/customer_login',
    async(info, { rejectWithValue,fulfillWithValue }) => {
        try {
            const {data} = await api.post('/customer/customer-login',info)
            localStorage.setItem('customerToken',data.token)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Email hoặc mật khẩu không chính xác' })
        }
    }
)
// End Method 

// Add this new thunk to get current user information
export const get_user_info = createAsyncThunk(
    'auth/getUserInfo',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/customer/current-user');
            return data;
        } catch (error) {
            if (error.response?.data?.error) {
                return rejectWithValue(error.response.data.error);
            } else {
                return rejectWithValue(error.message || 'Lỗi lấy thông tin người dùng');
            }
        }
    }
);

const decodeToken = (token) => {
    if (token) {
        const userInfo = jwtDecode(token)
        return userInfo
    } else {
        return ''
    }
}
// End Method 

// Update user info
export const update_user_info = createAsyncThunk(
    'auth/updateUserInfo',
    async (userInfo, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/customer/update-profile', userInfo, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // Update localStorage with new token if provided
            if (data.token) {
                localStorage.setItem('customerToken', data.token);
            }
            
            return data;
        } catch (error) {
            if (error.response?.data?.error) {
                return rejectWithValue(error.response.data.error);
            } else {
                return rejectWithValue(error.message || 'Lỗi cập nhật thông tin');
            }
        }
    }
);

// User logout
export const user_logout = createAsyncThunk(
    'auth/user_logout',
    async (_, { rejectWithValue }) => {
        try {
            localStorage.removeItem('customerToken');
            return { success: true };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const authReducer = createSlice({
    name: 'auth',
    initialState:{
        loader : false,
        userInfo : decodeToken(localStorage.getItem('customerToken')),
        errorMessage : '',
        successMessage: '', 
    },
    reducers : {

        messageClear : (state,_) => {
            state.errorMessage = ""
            state.successMessage = ""
        },
        user_reset: (state,_) => {
            state.userInfo = ""
        }
 
    },
    extraReducers: (builder) => {
        builder
        .addCase(customer_register.pending, (state, { payload }) => {
            state.loader = true;
        })
        .addCase(customer_register.rejected, (state, { payload }) => {
            state.errorMessage = payload.error;
            state.loader = false;
        })
        .addCase(customer_register.fulfilled, (state, { payload }) => {
            const userInfo = decodeToken(payload.token)
            state.successMessage = payload.message;
            state.loader = false;
            state.userInfo = userInfo
        })

        .addCase(customer_login.pending, (state, { payload }) => {
            state.loader = true;
        })
        .addCase(customer_login.rejected, (state, { payload }) => {
            state.errorMessage = payload?.error || 'Email hoặc mật khẩu không chính xác';
            state.loader = false;
        })
        .addCase(customer_login.fulfilled, (state, { payload }) => {
            const userInfo = decodeToken(payload.token)
            state.successMessage = payload.message;
            state.loader = false;
            state.userInfo = userInfo
        })

        // Get user info
        .addCase(get_user_info.pending, (state) => {
            state.loader = true;
        })
        .addCase(get_user_info.fulfilled, (state, { payload }) => {
            state.loader = false;
            if (payload.userInfo) {
                // Merge with existing userInfo from token
                state.userInfo = {
                    ...state.userInfo,
                    ...payload.userInfo
                };
            }
        })
        .addCase(get_user_info.rejected, (state) => {
            state.loader = false;
        })

        // Update user info
        .addCase(update_user_info.pending, (state) => {
            state.loader = true;
            state.errorMessage = '';
        })
        .addCase(update_user_info.fulfilled, (state, { payload }) => {
            state.loader = false;
            
            // Update user info with the data returned from API
            if (payload.userInfo) {
                state.userInfo = {
                    ...state.userInfo,
                    name: payload.userInfo.name,
                    email: payload.userInfo.email,
                    image: payload.userInfo.image
                };
            }
            
            // If server returned a new token with updated user info
            if (payload.token) {
                // We should update the token in localStorage
                localStorage.setItem('customerToken', payload.token);
                
                // Also decode the token to get the updated user info
                const decodedInfo = decodeToken(payload.token);
                // Only update non-image fields from token to avoid overriding image from userInfo
                if (decodedInfo) {
                    state.userInfo = {
                        ...state.userInfo,
                        id: decodedInfo.id,
                        name: decodedInfo.name,
                        email: decodedInfo.email,
                        method: decodedInfo.method
                    };
                }
            }
            
            state.successMessage = payload.message;
        })
        .addCase(update_user_info.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload;
        })

        // User logout
        .addCase(user_logout.pending, (state) => {
            state.loader = true;
        })
        .addCase(user_logout.fulfilled, (state) => {
            state.loader = false;
            state.userInfo = '';
            state.successMessage = 'Đăng xuất thành công';
        })
        .addCase(user_logout.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload;
        })
    }
})
export const {messageClear,user_reset} = authReducer.actions
export default authReducer.reducer