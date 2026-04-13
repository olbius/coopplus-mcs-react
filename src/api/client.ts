import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Token refresh queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

const getStoredAuth = () => {
  const authData = localStorage.getItem('auth-storage');
  if (!authData) return null;
  try {
    return JSON.parse(authData).state ?? null;
  } catch {
    return null;
  }
};

const clearAuthAndRedirect = () => {
  localStorage.removeItem('auth-storage');
  window.location.href = '/login';
};

// Request interceptor — inject Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const auth = getStoredAuth();
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 with token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Detect session expired in 200 responses
    const data = response.data as Record<string, unknown> | undefined;
    const errDesc = String(data?.errorDescription ?? data?.errorMessage ?? '');
    if (errDesc.includes('userLogin') && errDesc.includes('null')) {
      clearAuthAndRedirect();
      return Promise.reject(new Error('Session expired'));
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 422 with "User login is missing" = auth error
    if (error.response?.status === 422) {
      const errMsg = String((error.response.data as Record<string, unknown>)?.errorDescription ?? '');
      if (errMsg.includes('User login is missing')) {
        clearAuthAndRedirect();
        return Promise.reject(error);
      }
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const auth = getStoredAuth();
    if (!auth?.refreshToken) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${env.API_BASE_URL}/auth/refresh-token`,
        {},
        { headers: { 'Content-Type': 'application/json', 'Refresh-Token': auth.refreshToken } }
      );

      const { access_token, refresh_token } = response.data.data;

      // Update persisted Zustand store
      const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      stored.state = { ...stored.state, token: access_token, refreshToken: refresh_token };
      localStorage.setItem('auth-storage', JSON.stringify(stored));

      processQueue(null, access_token);
      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const handleApiError = (error: unknown): { message: string; statusCode: number } => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.errorMessage || error.response?.data?.message || error.message,
      statusCode: error.response?.status || 500,
    };
  }
  return { message: 'An unexpected error occurred', statusCode: 500 };
};
