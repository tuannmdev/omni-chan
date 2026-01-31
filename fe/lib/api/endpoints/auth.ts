/**
 * Authentication API Endpoints
 */

import apiClient from "../client";
import {
  RegisterDto,
  LoginDto,
  AuthResponse,
  RefreshTokenDto,
} from "@/types/api/auth";
import { UserResponse } from "@/types/api/user";
import { ApiResponse } from "@/types/common";

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterDto): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post("/api/auth/register", data);
  },

  /**
   * Login user
   */
  login: async (data: LoginDto): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post("/api/auth/login", data);
  },

  /**
   * Refresh access token
   */
  refresh: async (
    data: RefreshTokenDto
  ): Promise<ApiResponse<{ accessToken: string }>> => {
    return apiClient.post("/api/auth/refresh", data);
  },

  /**
   * Get current authenticated user
   */
  me: async (): Promise<ApiResponse<UserResponse>> => {
    return apiClient.get("/api/auth/me");
  },

  /**
   * Logout user (client-side - just returns success)
   */
  logout: async (): Promise<ApiResponse<null>> => {
    return apiClient.post("/api/auth/logout");
  },
};
