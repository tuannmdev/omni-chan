/**
 * AI API Endpoints
 */

import apiClient from "../client";
import { AiSuggestionResponse } from "@/types/api/ai";
import { ApiResponse } from "@/types/common";

export const aiApi = {
  /**
   * Get AI suggestions for a conversation
   */
  getSuggestions: async (
    conversationId: string
  ): Promise<ApiResponse<AiSuggestionResponse>> => {
    return apiClient.get(`/api/conversations/${conversationId}/ai-suggestions`);
  },

  /**
   * Submit feedback on AI suggestion
   */
  submitFeedback: async (
    suggestionId: string,
    feedback: {
      adopted: boolean;
      helpful: boolean;
      feedback?: string;
    }
  ): Promise<ApiResponse<null>> => {
    return apiClient.post(`/api/ai/suggestions/${suggestionId}/feedback`, feedback);
  },
};
