import axios from 'axios';
import { storage } from '../utils/storage';
import { router } from 'expo-router';
// ✅ Import from globalTokenStore instead of contexts (breaks cycle)
import { getGlobalSetToken, getGlobalSetDToken } from '../context/globalTokenStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
    failedQueue = [];
};

api.interceptors.request.use(async (config) => {
    const role = await storage.getItem('role');
    const tokenKey = role === 'doctor' ? 'dToken' : 'token';
    const accessToken = await storage.getItem(tokenKey);
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        console.log(`🔴 API Error: ${status} on ${originalRequest?.url}`);

        if (status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                if (originalRequest.data instanceof FormData) {
                    originalRequest.transformRequest = [(data) => data];
                }
                return api(originalRequest);
            }).catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = await storage.getItem('refreshToken');
        if (!refreshToken) {
            isRefreshing = false;
            await storage.multiRemove(['token', 'dToken', 'refreshToken', 'user', 'role']);
            router.replace('/(auth)/login');
            return Promise.reject(error);
        }

        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/auth/refresh`,
                { refreshToken },
                { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
            );

            if (!res.data?.success) throw new Error("Refresh response missing success:true");

            const newAccessToken = res.data.accessToken;
            const newRefreshToken = res.data.refreshToken;
            const role = await storage.getItem('role');
            const tokenKey = role === 'doctor' ? 'dToken' : 'token';

            await storage.setItem(tokenKey, newAccessToken);
            await storage.setItem('refreshToken', newRefreshToken);

            if (role === 'patient') {
                const setter = getGlobalSetToken();
                if (setter) setter(newAccessToken);
            } else if (role === 'doctor') {
                const setter = getGlobalSetDToken();
                if (setter) setter(newAccessToken);
            }

            processQueue(null, newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            if (originalRequest.data instanceof FormData) {
                originalRequest.transformRequest = [(data) => data];
            }

            return api(originalRequest);

        } catch (refreshError) {
            processQueue(refreshError, null);
            await storage.multiRemove(['token', 'dToken', 'refreshToken', 'user', 'role']);
            router.replace('/(auth)/login');
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;