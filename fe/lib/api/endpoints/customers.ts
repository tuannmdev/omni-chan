/**
 * Customers API Endpoints
 */

import apiClient from "../client";
import {
  CustomerResponse,
  CreateCustomerDto,
  UpdateCustomerDto,
} from "@/types/api/customer";
import { ApiResponse, PaginatedResponse } from "@/types/common";

export const customersApi = {
  /**
   * Get all customers with pagination and filters
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    segment?: string;
    platform?: string;
    search?: string;
  }): Promise<PaginatedResponse<CustomerResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.segment) queryParams.append("segment", params.segment);
    if (params?.platform) queryParams.append("platform", params.platform);
    if (params?.search) queryParams.append("search", params.search);

    return apiClient.get(`/api/customers?${queryParams.toString()}`);
  },

  /**
   * Get customer by ID
   */
  getById: async (id: string): Promise<ApiResponse<CustomerResponse>> => {
    return apiClient.get(`/api/customers/${id}`);
  },

  /**
   * Create new customer
   */
  create: async (
    data: CreateCustomerDto
  ): Promise<ApiResponse<CustomerResponse>> => {
    return apiClient.post("/api/customers", data);
  },

  /**
   * Update customer
   */
  update: async (
    id: string,
    data: UpdateCustomerDto
  ): Promise<ApiResponse<CustomerResponse>> => {
    return apiClient.put(`/api/customers/${id}`, data);
  },

  /**
   * Delete customer
   */
  delete: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/api/customers/${id}`);
  },
};
