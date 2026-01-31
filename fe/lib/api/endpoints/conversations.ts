/**
 * Conversations API Endpoints
 */

import apiClient from "../client";
import {
  ConversationResponse,
  CreateConversationDto,
  UpdateConversationDto,
  MessageResponse,
} from "@/types/api/conversation";
import { ApiResponse, PaginatedResponse } from "@/types/common";

export const conversationsApi = {
  /**
   * Get all conversations with pagination and filters
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    platform?: string;
  }): Promise<PaginatedResponse<ConversationResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.platform) queryParams.append("platform", params.platform);

    return apiClient.get(`/api/conversations?${queryParams.toString()}`);
  },

  /**
   * Get conversation by ID with messages and AI suggestions
   */
  getById: async (id: string): Promise<ApiResponse<ConversationResponse>> => {
    return apiClient.get(`/api/conversations/${id}`);
  },

  /**
   * Create new conversation
   */
  create: async (
    data: CreateConversationDto
  ): Promise<ApiResponse<ConversationResponse>> => {
    return apiClient.post("/api/conversations", data);
  },

  /**
   * Update conversation status
   */
  updateStatus: async (
    id: string,
    status: string
  ): Promise<ApiResponse<ConversationResponse>> => {
    return apiClient.patch(`/api/conversations/${id}/status`, { status });
  },

  /**
   * Assign conversation to agent
   */
  assign: async (
    id: string,
    assignedAgentId: string
  ): Promise<ApiResponse<ConversationResponse>> => {
    return apiClient.patch(`/api/conversations/${id}/assign`, {
      assignedAgentId,
    });
  },

  /**
   * Send message in conversation
   */
  sendMessage: async (
    id: string,
    message: string
  ): Promise<ApiResponse<MessageResponse>> => {
    return apiClient.post(`/api/conversations/${id}/messages`, { message });
  },
};
