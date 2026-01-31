/**
 * Response Suggestions Component
 * Display AI-generated response templates with copy functionality
 */

import { ResponseSuggestion } from "@/types/api/ai";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ResponseSuggestionsProps {
  suggestions: ResponseSuggestion[];
  onCopyResponse?: (text: string) => void;
}

const typeLabels: Record<string, string> = {
  greeting: "Chào hỏi",
  product_info: "Thông tin sản phẩm",
  support: "Hỗ trợ",
  closing: "Kết thúc",
};

const typeColors: Record<string, "default" | "secondary" | "outline"> = {
  greeting: "secondary",
  product_info: "default",
  support: "outline",
  closing: "secondary",
};

export function ResponseSuggestions({
  suggestions,
  onCopyResponse,
}: ResponseSuggestionsProps): JSX.Element {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number): Promise<void> => {
    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(text);

      // Show feedback
      setCopiedIndex(index);
      toast.success("Đã sao chép câu trả lời");

      // Call callback if provided
      if (onCopyResponse) {
        onCopyResponse(text);
      }

      // Reset after 2 seconds
      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Không thể sao chép");
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">
            Câu trả lời gợi ý
          </h3>
        </div>
        <div className="text-center py-6">
          <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Chưa có gợi ý trả lời</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900">
          Câu trả lời gợi ý ({suggestions.length})
        </h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow"
          >
            {/* Header with type and confidence */}
            <div className="flex items-center justify-between mb-2">
              <Badge variant={typeColors[suggestion.type]} className="text-xs">
                {typeLabels[suggestion.type] || suggestion.type}
              </Badge>
              <span className="text-xs text-gray-500">
                {Math.round(suggestion.confidence * 100)}%
              </span>
            </div>

            {/* Suggested Text */}
            <p className="text-sm text-gray-700 mb-2 leading-relaxed whitespace-pre-wrap">
              {suggestion.text}
            </p>

            {/* Context */}
            {suggestion.context && (
              <p className="text-xs text-gray-500 mb-3 italic">
                {suggestion.context}
              </p>
            )}

            {/* Copy Button */}
            <Button
              size="sm"
              variant={copiedIndex === index ? "default" : "outline"}
              className="w-full text-xs"
              onClick={() => handleCopy(suggestion.text, index)}
              disabled={copiedIndex === index}
            >
              {copiedIndex === index ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Đã sao chép
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Sao chép
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
