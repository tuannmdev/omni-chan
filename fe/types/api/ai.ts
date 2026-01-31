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
