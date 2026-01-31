"use client";

/**
 * AI Suggestions Panel Component
 * Collapsible left sidebar with AI analysis and suggestions
 */

import { useState } from "react";
import { AiSuggestionResponse } from "@/types/api/ai";
import { ConversationAnalysis } from "./ConversationAnalysis";
import { ProductRecommendations } from "./ProductRecommendations";
import { ResponseSuggestions } from "./ResponseSuggestions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Sparkles, AlertCircle } from "lucide-react";

interface AISuggestionsPanelProps {
  suggestions: AiSuggestionResponse | null;
  isLoading: boolean;
  error: string | null;
  onCopyResponse?: (text: string) => void;
  onSendProduct?: (productId: string, productName: string) => void;
}

export function AISuggestionsPanel({
  suggestions,
  isLoading,
  error,
  onCopyResponse,
  onSendProduct,
}: AISuggestionsPanelProps): JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const togglePanel = (): void => {
    setIsCollapsed((prev) => !prev);
  };

  // Collapsed state
  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-r flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePanel}
          className="mb-4"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="writing-mode-vertical text-xs text-gray-500 font-medium">
          AI Gợi ý
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h2 className="text-base font-semibold text-gray-900">AI Gợi ý</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={togglePanel}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Loading State */}
        {isLoading && !suggestions && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !suggestions && (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 text-center">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && !suggestions && (
          <div className="flex flex-col items-center justify-center py-12">
            <Sparkles className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 text-center">
              Chọn một hội thoại để xem gợi ý AI
            </p>
          </div>
        )}

        {/* Suggestions Content */}
        {suggestions && (
          <>
            {/* Conversation Analysis */}
            <ConversationAnalysis analysis={suggestions.analysis} />

            {/* Divider */}
            <div className="border-t" />

            {/* Response Suggestions */}
            <ResponseSuggestions
              suggestions={suggestions.responseSuggestions}
              onCopyResponse={onCopyResponse}
            />

            {/* Divider */}
            <div className="border-t" />

            {/* Product Recommendations */}
            <ProductRecommendations
              recommendations={suggestions.productRecommendations}
              onSendProduct={onSendProduct}
            />

            {/* Metadata */}
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-400 text-center">
                Tạo lúc: {new Date(suggestions.generatedAt).toLocaleString("vi-VN")}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
