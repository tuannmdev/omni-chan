/**
 * AI Integration Type Definitions
 */

export interface ConversationAnalysis {
  intent: string;
  sentiment: "positive" | "neutral" | "negative";
  purchaseProbability: number;
  urgencyLevel: "low" | "normal" | "high" | "critical";
  keywords: string[];
  summary: string;
}

export interface ProductRecommendation {
  productId: string;
  productName: string;
  reason: string;
  confidence: number;
  price?: number;
  available?: boolean;
}

export interface ResponseSuggestion {
  text: string;
  type: "greeting" | "product_info" | "support" | "closing";
  confidence: number;
  context: string;
}

export interface AiSuggestionResponse {
  conversationId: string;
  analysis: ConversationAnalysis;
  productRecommendations: ProductRecommendation[];
  responseSuggestions: ResponseSuggestion[];
  generatedAt: Date;
  expiresAt: Date;
}

export interface AnalyzeConversationDto {
  conversationId: string;
  includeRecommendations?: boolean;
  includeSuggestions?: boolean;
}

export interface OpenAICompletionRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface OpenAICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export type ConversationIntent =
  | "product_inquiry"
  | "support_request"
  | "complaint"
  | "order_status"
  | "pricing_question"
  | "general_question"
  | "feedback"
  | "other";

export type SentimentType = "positive" | "neutral" | "negative";

export type UrgencyLevel = "low" | "normal" | "high" | "critical";
