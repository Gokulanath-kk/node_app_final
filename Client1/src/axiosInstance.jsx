import axios from 'axios';

// const axiosInstance = axios.create({
//   baseURL: process.env.BASE_URL || 'https://quiz-server.xicsolutions.in/',
// });

const axiosInstance = axios.create({
  baseURL: process.env.BASE_URL || 'https://quiz-server.xicsolutions.in/',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('token'); 
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;
