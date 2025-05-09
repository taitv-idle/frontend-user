import axios from "axios";

// Cấu hình API
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor
api.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('Making request to:', config.url, 'with data:', config.data);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.data);
        return response;
    },
    (error) => {
        
        if (error.code === 'ERR_NETWORK') {
            console.error('Network error:', error);
            return Promise.reject({
                message: 'Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.'
            });
        }
        
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout:', error);
            return Promise.reject({
                message: 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại sau.'
            });
        }

        if (error.response) {
            // Server trả về response với status code nằm ngoài range 2xx
            console.error('Server error:', error.response.data);
            return Promise.reject(error.response.data);
        }

        return Promise.reject(error);
    }
);

export default api;