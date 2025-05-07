import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api"; 

export const add_friend = createAsyncThunk(
    'chat/add_friend',
    async(info, { rejectWithValue,fulfillWithValue }) => {
        try {
            const {data} = await api.post('/chat/customer/add-customer-friend',info)
           // console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)
// End Method 

export const send_message = createAsyncThunk(
    'chat/send_message',
    async(info, { rejectWithValue,fulfillWithValue }) => {
        try {
            const {data} = await api.post('/chat/customer/send-message-to-seller',info)
            //  console.log(data)
             return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)
// End Method 

export const search_sellers = createAsyncThunk(
    'chat/search_sellers',
    async(query, { rejectWithValue, fulfillWithValue }) => {
        try {
            const {data} = await api.get(`/chat/search-sellers?query=${encodeURIComponent(query)}`)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const chatReducer = createSlice({
    name: 'chat',
    initialState:{
        my_friends: [],
        fb_messages : [],
        currentFd: "",
        errorMessage : '',
        successMessage: '',
        searchResults: [],
        isSearching: false
    },
    reducers : {
        messageClear : (state,_) => {
            state.errorMessage = ""
            state.successMessage = ""
        },
        updateMessage: (state, {payload}) => {
            state.fb_messages = [...state.fb_messages, payload]
        },
        clearSearchResults: (state) => {
            state.searchResults = []
            state.isSearching = false
        }
    },
    extraReducers: (builder) => {
        builder 
        .addCase(add_friend.fulfilled, (state, { payload }) => { 
            state.fb_messages = payload.messages;
            state.currentFd = payload.currentFd;
            state.my_friends = payload.MyFriends;
        })
        .addCase(send_message.fulfilled, (state, { payload }) => { 
            let tempFriends = state.my_friends
            let index = tempFriends.findIndex(f => f.fdId === payload.message.receverId)
            while (index > 0) {
                let temp = tempFriends[index]
                tempFriends[index] = tempFriends[index - 1]
                tempFriends[index - 1] = temp
                index--
            }            
            state.my_friends = tempFriends;
            state.fb_messages = [...state.fb_messages, payload.message];
            state.successMessage = 'Message Send Success';
        })
        .addCase(search_sellers.pending, (state) => {
            state.isSearching = true
            state.errorMessage = ''
        })
        .addCase(search_sellers.fulfilled, (state, { payload }) => {
            state.isSearching = false
            state.searchResults = payload.sellers || []
        })
        .addCase(search_sellers.rejected, (state, { payload }) => {
            state.isSearching = false
            state.errorMessage = payload?.message || 'Lỗi khi tìm kiếm người bán'
            state.searchResults = []
        })
    }
})

export const {messageClear, updateMessage, clearSearchResults} = chatReducer.actions
export default chatReducer.reducer