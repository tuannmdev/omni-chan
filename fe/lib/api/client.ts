/**
 * API Client
 * Axios instance with request/response interceptors
 */

import axios, { AxiosError, AxiosInstance } from "axios";
import { ApiError, ApiResponse } from "@/types/common";

/**
 * Custom API Error class
 */
export class ApiClientError extends Error {
  public statusCode: number;
  public error: string;

  constructor(statusCode: number, message: string, error: string) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.error = error;
  }
}

/**
 * Axios instance with base configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor
 * Adds authentication token to all requests
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles errors and token refresh
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return data directly for successful responses
    return response.data;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && originalRequest) {
      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          // No refresh token, redirect to login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Try to refresh the access token
        const response = await axios.post<ApiResponse<{ accessToken: string }>>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          { refreshToken }
        );

        if (response.data.success && response.data.data?.accessToken) {
          const newAccessToken = response.data.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } else {
          // Refresh failed, redirect to login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const apiError = error.response?.data;

    if (apiError) {
      throw new ApiClientError(
        apiError.statusCode,
        apiError.message || "Đã xảy ra lỗi",
        apiError.error || "UNKNOWN_ERROR"
      );
    }

    // Network error or timeout
    throw new ApiClientError(
      500,
      "Không thể kết nối đến máy chủ",
      "NETWORK_ERROR"
    );
  }
);

export default apiClient;
