/**
 * Integrations API Endpoints
 */

import apiClient from "../client";
import { ApiResponse } from "@/types/common";

interface IntegrationResponse {
  id: string;
  platform: string;
  platformAccountId: string | null;
  platformAccountName: string | null;
  pageId: string | null;
  pageName: string | null;
  isActive: boolean;
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface FacebookPageResponse {
  id: string;
  name: string;
  category: string;
  access_token: string;
}

export const integrationsApi = {
  /**
   * Get all integrations
   */
  getAll: async (): Promise<ApiResponse<IntegrationResponse[]>> => {
    return apiClient.get("/api/integrations");
  },

  /**
   * Get integration by ID
   */
  getById: async (id: string): Promise<ApiResponse<IntegrationResponse>> => {
    return apiClient.get(`/api/integrations/${id}`);
  },

  /**
   * Connect Facebook page
   */
  connectFacebook: async (data: {
    code: string;
    redirectUri: string;
    pageId: string;
  }): Promise<ApiResponse<IntegrationResponse>> => {
    return apiClient.post("/api/integrations/facebook/connect", data);
  },

  /**
   * Get Facebook pages user has access to
   */
  getFacebookPages: async (
    accessToken: string
  ): Promise<ApiResponse<FacebookPageResponse[]>> => {
    return apiClient.get(
      `/api/integrations/facebook/pages?accessToken=${accessToken}`
    );
  },

  /**
   * Disconnect integration
   */
  disconnect: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/api/integrations/${id}/disconnect`);
  },
};
