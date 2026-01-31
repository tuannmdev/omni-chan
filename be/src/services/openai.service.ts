/**
 * OpenAI Service
 * Handles AI-powered conversation analysis and suggestions
 */

import axios from "axios";
import { logger } from "../utils/logger";
import { AppError } from "../middleware/error.middleware";
import { HTTP_STATUS } from "../utils/constants";
import {
  ConversationAnalysis,
  OpenAICompletionRequest,
  OpenAICompletionResponse,
  ConversationIntent,
  SentimentType,
  UrgencyLevel,
} from "../types/ai.types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export class OpenAIService {
  /**
   * Analyze conversation to extract intent, sentiment, and other insights
   */
  public static async analyzeConversation(
    conversationText: string,
    customerName?: string
  ): Promise<ConversationAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(conversationText, customerName);
      const response = await this.callOpenAI(prompt, 0.3, 500);

      const analysis = this.parseAnalysisResponse(response);
      logger.info("Conversation analysis completed");

      return analysis;
    } catch (error) {
      logger.error("Error analyzing conversation:", error);
      throw new AppError(
        "Không thể phân tích cuộc hội thoại",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Generate response suggestions based on conversation context
   */
  public static async generateResponseSuggestions(
    conversationText: string,
    customerName: string,
    intent: ConversationIntent,
    sentiment: SentimentType
  ): Promise<string[]> {
    try {
      const prompt = this.buildResponseSuggestionPrompt(
        conversationText,
        customerName,
        intent,
        sentiment
      );

      const response = await this.callOpenAI(prompt, 0.7, 300);
      const suggestions = this.parseResponseSuggestions(response);

      logger.info(`Generated ${suggestions.length} response suggestions`);
      return suggestions;
    } catch (error) {
      logger.error("Error generating response suggestions:", error);
      throw new AppError(
        "Không thể tạo gợi ý trả lời",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Extract keywords from conversation
   */
  public static async extractKeywords(conversationText: string): Promise<string[]> {
    try {
      const prompt = `Trích xuất các từ khóa quan trọng từ cuộc hội thoại sau (chỉ trả về danh sách từ khóa, phân cách bằng dấu phẩy):

Cuộc hội thoại:
${conversationText}

Từ khóa:`;

      const response = await this.callOpenAI(prompt, 0.3, 100);
      const keywords = response
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      return keywords;
    } catch (error) {
      logger.error("Error extracting keywords:", error);
      return [];
    }
  }

  /**
   * Call OpenAI API
   */
  private static async callOpenAI(
    prompt: string,
    temperature: number = 0.7,
    maxTokens: number = 500
  ): Promise<string> {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === "sk-your-openai-api-key-here") {
      logger.warn("OpenAI API key not configured, using mock response");
      return this.getMockResponse(prompt);
    }

    const request: OpenAICompletionRequest = {
      model: OPENAI_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature,
      max_tokens: maxTokens,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    try {
      const response = await axios.post<OpenAICompletionResponse>(
        OPENAI_API_URL,
        request,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const content = response.data.choices[0]?.message?.content || "";
      logger.debug(`OpenAI response: ${content.substring(0, 100)}...`);

      return content.trim();
    } catch (error: any) {
      logger.error("OpenAI API error:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Build analysis prompt
   */
  private static buildAnalysisPrompt(
    conversationText: string,
    customerName?: string
  ): string {
    return `Phân tích cuộc hội thoại sau và trả về kết quả dưới dạng JSON với cấu trúc:
{
  "intent": "product_inquiry | support_request | complaint | order_status | pricing_question | general_question | feedback | other",
  "sentiment": "positive | neutral | negative",
  "purchaseProbability": 0.0-1.0,
  "urgencyLevel": "low | normal | high | critical",
  "keywords": ["keyword1", "keyword2", ...],
  "summary": "Tóm tắt ngắn gọn cuộc hội thoại"
}

Cuộc hội thoại${customerName ? ` với khách hàng ${customerName}` : ""}:
${conversationText}

Phân tích (chỉ trả về JSON, không có text khác):`;
  }

  /**
   * Build response suggestion prompt
   */
  private static buildResponseSuggestionPrompt(
    conversationText: string,
    customerName: string,
    intent: ConversationIntent,
    sentiment: SentimentType
  ): string {
    const tone =
      sentiment === "negative"
        ? "thân thiện, đồng cảm và giải quyết vấn đề"
        : sentiment === "positive"
        ? "nhiệt tình và tích cực"
        : "lịch sự và chuyên nghiệp";

    return `Dựa trên cuộc hội thoại sau, hãy đề xuất 3 câu trả lời phù hợp bằng tiếng Việt.

Thông tin:
- Tên khách hàng: ${customerName}
- Mục đích: ${intent}
- Cảm xúc: ${sentiment}
- Giọng điệu: ${tone}

Cuộc hội thoại:
${conversationText}

Hãy trả về 3 câu trả lời, mỗi câu trên một dòng, bắt đầu bằng số thứ tự (1., 2., 3.):`;
  }

  /**
   * Parse analysis response from OpenAI
   */
  private static parseAnalysisResponse(response: string): ConversationAnalysis {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          intent: parsed.intent || "other",
          sentiment: parsed.sentiment || "neutral",
          purchaseProbability: parsed.purchaseProbability || 0.5,
          urgencyLevel: parsed.urgencyLevel || "normal",
          keywords: parsed.keywords || [],
          summary: parsed.summary || "Không có tóm tắt",
        };
      }

      // Fallback to default
      logger.warn("Could not parse OpenAI response, using defaults");
      return this.getDefaultAnalysis();
    } catch (error) {
      logger.error("Error parsing analysis response:", error);
      return this.getDefaultAnalysis();
    }
  }

  /**
   * Parse response suggestions
   */
  private static parseResponseSuggestions(response: string): string[] {
    const lines = response.split("\n").filter((line) => line.trim().length > 0);
    const suggestions: string[] = [];

    for (const line of lines) {
      // Remove numbering (1., 2., 3., etc.)
      const cleaned = line.replace(/^\d+\.\s*/, "").trim();
      if (cleaned.length > 0) {
        suggestions.push(cleaned);
      }
    }

    return suggestions.slice(0, 3); // Return max 3 suggestions
  }

  /**
   * Get default analysis when OpenAI fails
   */
  private static getDefaultAnalysis(): ConversationAnalysis {
    return {
      intent: "general_question",
      sentiment: "neutral",
      purchaseProbability: 0.5,
      urgencyLevel: "normal",
      keywords: [],
      summary: "Cuộc hội thoại chung",
    };
  }

  /**
   * Get mock response for development/testing
   */
  private static getMockResponse(prompt: string): string {
    if (prompt.includes("Phân tích cuộc hội thoại")) {
      return JSON.stringify({
        intent: "product_inquiry",
        sentiment: "positive",
        purchaseProbability: 0.75,
        urgencyLevel: "normal",
        keywords: ["sản phẩm", "giá", "màu sắc"],
        summary: "Khách hàng hỏi về sản phẩm và giá cả",
      });
    }

    if (prompt.includes("đề xuất 3 câu trả lời")) {
      return `1. Xin chào! Cảm ơn bạn đã quan tâm đến sản phẩm của chúng tôi. Tôi có thể giúp gì cho bạn?
2. Chào bạn! Rất vui được hỗ trợ bạn. Bạn muốn tìm hiểu về sản phẩm nào?
3. Xin chào! Chúng tôi luôn sẵn sàng tư vấn cho bạn. Bạn cần thông tin gì ạ?`;
    }

    return "Mock response from OpenAI";
  }
}
