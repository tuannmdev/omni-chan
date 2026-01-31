"use client";

/**
 * Conversation Context
 * Manages conversation list, active conversation, and filters
 */

import React, { createContext, useState, useCallback } from "react";
import { conversationsApi } from "@/lib/api/endpoints/conversations";
import { ConversationResponse } from "@/types/api/conversation";
import { PaginatedResponse } from "@/types/common";

interface ConversationFilters {
  status?: string;
  platform?: string;
  page: number;
  limit: number;
}

interface ConversationContextType {
  conversations: ConversationResponse[];
  activeConversation: ConversationResponse | null;
  filters: ConversationFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  clearActiveConversation: () => void;
  updateFilters: (newFilters: Partial<ConversationFilters>) => void;
  refreshConversation: (id: string) => Promise<void>;
}

export const ConversationContext = createContext<
  ConversationContextType | undefined
>(undefined);

interface ConversationProviderProps {
  children: React.ReactNode;
}

const initialFilters: ConversationFilters = {
  page: 1,
  limit: 20,
};

export function ConversationProvider({
  children,
}: ConversationProviderProps): JSX.Element {
  const [conversations, setConversations] = useState<ConversationResponse[]>(
    []
  );
  const [activeConversation, setActiveConversation] =
    useState<ConversationResponse | null>(null);
  const [filters, setFilters] = useState<ConversationFilters>(initialFilters);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch conversations with current filters
   */
  const fetchConversations = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response: PaginatedResponse<ConversationResponse> =
        await conversationsApi.getAll(filters);

      if (response.success) {
        setConversations(response.data);
        setPagination(response.pagination);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải hội thoại";
      setError(errorMessage);
      console.error("Failed to fetch conversations:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  /**
   * Select and fetch a conversation by ID
   */
  const selectConversation = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await conversationsApi.getById(id);

      if (response.success && response.data) {
        setActiveConversation(response.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải hội thoại";
      setError(errorMessage);
      console.error("Failed to fetch conversation:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear active conversation
   */
  const clearActiveConversation = useCallback((): void => {
    setActiveConversation(null);
  }, []);

  /**
   * Update filters and reset to page 1
   */
  const updateFilters = useCallback(
    (newFilters: Partial<ConversationFilters>): void => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
        page: newFilters.page !== undefined ? newFilters.page : 1,
      }));
    },
    []
  );

  /**
   * Refresh a specific conversation (for real-time updates)
   */
  const refreshConversation = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await conversationsApi.getById(id);

      if (response.success && response.data) {
        // Update in list
        setConversations((prev) =>
          prev.map((conv) => (conv.id === id ? response.data! : conv))
        );

        // Update active if it's the same conversation
        if (activeConversation?.id === id) {
          setActiveConversation(response.data);
        }
      }
    } catch (err) {
      console.error("Failed to refresh conversation:", err);
    }
  }, [activeConversation?.id]);

  const value: ConversationContextType = {
    conversations,
    activeConversation,
    filters,
    pagination,
    isLoading,
    error,
    fetchConversations,
    selectConversation,
    clearActiveConversation,
    updateFilters,
    refreshConversation,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}
