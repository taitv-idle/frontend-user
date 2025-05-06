import axios from "axios";
const development = 'http://localhost:5000'; // Môi trường dev
const production = 'http://localhost:8000';  // Môi trường production (đổi cổng)

let api_url = '';
const mode = 'development';

if (mode === 'development') {
    api_url = development; // Dev dùng localhost:5000
} else {
    api_url = production;  // Production dùng localhost:8000 (hoặc URL thực tế)
}

const api = axios.create({
    baseURL: `${api_url}/api`
});

export default api;