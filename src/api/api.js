import axios from "axios";

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Cache configuration để lưu trữ tạm thời kết quả API
const apiCache = new Map();
const CACHE_TIME = 5 * 60 * 1000; // 5 phút, điều chỉnh theo nhu cầu

// Cấu hình API
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
    timeout: 60000, // Tăng từ 30000 lên 60000ms
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor
api.interceptors.request.use(
    (config) => {
        // Add retry config
        config.retryCount = 0;
        
        // Add cache config
        config.useCache = config.method === 'get';
        config.cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
        
        // Kiểm tra cache nếu là GET request và cho phép cache
        if (config.useCache && apiCache.has(config.cacheKey)) {
            const cacheData = apiCache.get(config.cacheKey);
            if (Date.now() - cacheData.timestamp < CACHE_TIME) {
                // Trả về cached data nếu còn hiệu lực
                config.adapter = () => {
                    return Promise.resolve({
                        data: cacheData.data,
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config,
                        request: {}
                    });
                };
                console.log(`Using cached data for: ${config.url}`);
            } else {
                // Xóa cache cũ nếu hết hạn
                apiCache.delete(config.cacheKey);
            }
        }
        
        // Add auth token if available
        const token = localStorage.getItem('customerToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Ensure requests with no data send an empty object for PUT/POST
        if ((config.method === 'put' || config.method === 'post') && config.data === undefined) {
            config.data = {};
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
        // Cache response for GET requests
        if (response.config.useCache) {
            apiCache.set(response.config.cacheKey, {
                data: response.data,
                timestamp: Date.now()
            });
            console.log(`Cached response for: ${response.config.url}`);
        }
        
        console.log('Response received:', response.data);
        return response;
    },
    async (error) => {
        const config = error.config;
        
        // Only retry if we haven't reached max retries and it's a timeout error or a network error
        if (
            config && 
            config.retryCount < MAX_RETRIES && 
            (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK')
        ) {
            config.retryCount += 1;
            
            console.log(`Retrying request (${config.retryCount}/${MAX_RETRIES}) to ${config.url} after timeout...`);
            
            // Wait for the retry delay
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            
            // Retry the request
            return api(config);
        }
        
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
            console.error('Server error:', error.response.data, 'Status:', error.response.status);
            console.error('Request that caused error:', {
                url: error.config.url,
                method: error.config.method,
                data: error.config.data
            });
            return Promise.reject(error.response.data);
        }

        return Promise.reject(error);
    }
);

// Helper function to clear cache (sử dụng khi cần làm mới dữ liệu)
api.clearCache = (url = null) => {
    if (url) {
        // Xóa cache cho URL cụ thể
        const keysToDelete = [];
        apiCache.forEach((value, key) => {
            if (key.startsWith(url)) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => apiCache.delete(key));
        console.log(`Cleared cache for: ${url}`);
    } else {
        // Xóa tất cả cache
        apiCache.clear();
        console.log('Cleared all API cache');
    }
};

export default api;