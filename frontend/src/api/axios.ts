import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth.store';

if (!import.meta.env.VITE_API_URL) {
  throw new Error('VITE_API_URL is missing in environment variables');
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh lock state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap NestJS TransformInterceptor envelope for non-paginated requests
    if (response.data && response.data.statusCode) {
      if (!response.data.meta && response.data.data !== undefined) {
        response.data = response.data.data;
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const authStore = useAuthStore.getState();
        if (!authStore.refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint directly to avoid circular interceptor dependencies
        const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken: authStore.refreshToken },
          { headers: { Authorization: `Bearer ${authStore.accessToken}` } }
        );

        authStore.setTokens(data.accessToken, data.refreshToken);
        processQueue(null, data.accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Standardize error format
    const apiError: ApiError = {
      message: (error.response?.data as any)?.message || error.message || 'An unexpected error occurred',
      statusCode: error.response?.status || 500,
      error: (error.response?.data as any)?.error,
    };

    return Promise.reject(apiError);
  }
);
