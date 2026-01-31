/**
 * Users API Endpoints
 */

import apiClient from "../client";
import { UpdateUserDto, UserResponse } from "@/types/api/user";
import { ApiResponse, PaginatedResponse } from "@/types/common";

export const usersApi = {
  /**
   * Get all users (admin/owner only)
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<UserResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    return apiClient.get(`/api/users?${queryParams.toString()}`);
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<ApiResponse<UserResponse>> => {
    return apiClient.get(`/api/users/${id}`);
  },

  /**
   * Update user
   */
  update: async (
    id: string,
    data: UpdateUserDto
  ): Promise<ApiResponse<UserResponse>> => {
    return apiClient.put(`/api/users/${id}`, data);
  },

  /**
   * Delete user (admin/owner only)
   */
  delete: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/api/users/${id}`);
  },
};
