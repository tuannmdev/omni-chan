/**
 * AI Suggestions Hook
 * Manage AI suggestions state and fetching
 */

import { useState, useCallback } from "react";
import { aiApi } from "@/lib/api/endpoints/ai";
import { AiSuggestionResponse } from "@/types/api/ai";

interface UseAISuggestionsReturn {
  suggestions: AiSuggestionResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchSuggestions: (conversationId: string) => Promise<void>;
  clearSuggestions: () => void;
}

export function useAISuggestions(): UseAISuggestionsReturn {
  const [suggestions, setSuggestions] = useState<AiSuggestionResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch AI suggestions for a conversation
   */
  const fetchSuggestions = useCallback(
    async (conversationId: string): Promise<void> => {
      if (!conversationId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await aiApi.getSuggestions(conversationId);

        if (response.success && response.data) {
          setSuggestions(response.data);
        } else {
          setError(response.message || "Không thể tải gợi ý AI");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Không thể tải gợi ý AI";
        setError(errorMessage);
        console.error("Failed to fetch AI suggestions:", err);
        // Don't show error toast to avoid spamming user
        // since this is called via polling
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Clear suggestions (when conversation changes)
   */
  const clearSuggestions = useCallback((): void => {
    setSuggestions(null);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
    clearSuggestions,
  };
}
