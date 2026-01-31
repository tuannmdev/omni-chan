/**
 * Unit Tests for OpenAI Service
 */

import axios from "axios";
import { OpenAIService } from "../../services/openai.service";

// Mock axios
jest.mock("axios");
jest.mock("../../utils/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("OpenAIService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set mock API key to trigger mock responses
    process.env.OPENAI_API_KEY = "sk-your-openai-api-key-here";
  });

  describe("analyzeConversation", () => {
    it("should analyze conversation and return structured analysis", async () => {
      const conversationText = `
Khách: Xin chào, tôi muốn hỏi về sản phẩm áo thun
Nhân viên: Dạ chào anh, em có thể tư vấn cho anh ạ
Khách: Có màu nào đẹp không?
`;

      const result = await OpenAIService.analyzeConversation(
        conversationText,
        "Nguyễn Văn A"
      );

      expect(result).toHaveProperty("intent");
      expect(result).toHaveProperty("sentiment");
      expect(result).toHaveProperty("purchaseProbability");
      expect(result).toHaveProperty("urgencyLevel");
      expect(result).toHaveProperty("keywords");
      expect(result).toHaveProperty("summary");

      expect(result.purchaseProbability).toBeGreaterThanOrEqual(0);
      expect(result.purchaseProbability).toBeLessThanOrEqual(1);
      expect(["positive", "neutral", "negative"]).toContain(result.sentiment);
      expect(["low", "normal", "high", "critical"]).toContain(result.urgencyLevel);
    });

    it("should return default analysis when OpenAI fails", async () => {
      (axios.post as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await OpenAIService.analyzeConversation("Test conversation");

      expect(result).toHaveProperty("intent");
      expect(result).toHaveProperty("sentiment");
      expect(result.sentiment).toBe("neutral");
    });
  });

  describe("generateResponseSuggestions", () => {
    it("should generate multiple response suggestions", async () => {
      const conversationText = "Khách: Tôi muốn hỏi về giá sản phẩm";

      const suggestions = await OpenAIService.generateResponseSuggestions(
        conversationText,
        "Nguyễn Văn A",
        "product_inquiry",
        "positive"
      );

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(3);

      suggestions.forEach((suggestion) => {
        expect(typeof suggestion).toBe("string");
        expect(suggestion.length).toBeGreaterThan(0);
      });
    });

    it("should handle empty conversation text", async () => {
      const suggestions = await OpenAIService.generateResponseSuggestions(
        "",
        "Customer",
        "general_question",
        "neutral"
      );

      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe("extractKeywords", () => {
    it("should extract keywords from conversation", async () => {
      const conversationText = "Tôi muốn mua áo thun màu xanh size M giá rẻ";

      const keywords = await OpenAIService.extractKeywords(conversationText);

      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBeGreaterThan(0);
    });

    it("should return empty array on error", async () => {
      (axios.post as jest.Mock).mockRejectedValue(new Error("API Error"));

      const keywords = await OpenAIService.extractKeywords("Test");

      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBe(0);
    });
  });

  describe("Mock responses", () => {
    it("should use mock response when API key is not configured", async () => {
      process.env.OPENAI_API_KEY = "sk-your-openai-api-key-here";

      const result = await OpenAIService.analyzeConversation("Test conversation");

      expect(result.intent).toBe("product_inquiry");
      expect(result.sentiment).toBe("positive");
      expect(result.purchaseProbability).toBe(0.75);
    });
  });

  describe("Response parsing", () => {
    it("should parse valid JSON response", async () => {
      const mockResponse = JSON.stringify({
        intent: "support_request",
        sentiment: "negative",
        purchaseProbability: 0.3,
        urgencyLevel: "high",
        keywords: ["hỗ trợ", "lỗi"],
        summary: "Khách hàng cần hỗ trợ về lỗi sản phẩm",
      });

      (axios.post as jest.Mock).mockResolvedValue({
        data: {
          choices: [
            {
              message: {
                content: mockResponse,
              },
            },
          ],
        },
      });

      // Temporarily set a different API key to trigger real API call path
      process.env.OPENAI_API_KEY = "sk-test-key";

      const result = await OpenAIService.analyzeConversation("Test");

      expect(result.intent).toBe("support_request");
      expect(result.sentiment).toBe("negative");
      expect(result.urgencyLevel).toBe("high");
    });

    it("should handle malformed JSON gracefully", async () => {
      (axios.post as jest.Mock).mockResolvedValue({
        data: {
          choices: [
            {
              message: {
                content: "This is not JSON",
              },
            },
          ],
        },
      });

      process.env.OPENAI_API_KEY = "sk-test-key";

      const result = await OpenAIService.analyzeConversation("Test");

      // Should return default analysis
      expect(result).toHaveProperty("intent");
      expect(result).toHaveProperty("sentiment");
    });
  });
});
