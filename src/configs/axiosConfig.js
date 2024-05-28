import axios from "axios";

const instanceAxios = axios.create({
    // Các cài đặt mặc định của Axios ở đây
    baseURL: process.env.URL_BACKEND,
    timeout: 5000, // Timeout của mỗi yêu cầu
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepter để thêm token vào mỗi yêu cầu trước khi gửi
instanceAxios.interceptors.request.use(
    config => {
        const token = JSON.parse(localStorage.getItem('account_admin')); // Lấy token từ local storage
        if (token) {
            config.headers.Authorization = `Bearer ${token.access_token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default instanceAxios;
