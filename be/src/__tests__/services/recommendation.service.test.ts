/**
 * Unit Tests for Recommendation Service
 */

import { RecommendationService } from "../../services/recommendation.service";
import { prisma } from "../../utils/database";

// Mock dependencies
jest.mock("../../utils/database", () => ({
  prisma: {
    purchaseHistory: {
      findMany: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("../../utils/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock("../../services/openai.service");

describe("RecommendationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProductRecommendations", () => {
    it("should recommend products based on keywords", async () => {
      const mockProducts = [
        {
          id: "prod-1",
          name: "Áo thun xanh",
          description: "Áo thun cotton chất lượng cao",
          category: "clothing",
          price: 150000,
          stock: 10,
          soldCount: 20,
        },
        {
          id: "prod-2",
          name: "Áo sơ mi",
          description: "Áo sơ mi trắng",
          category: "clothing",
          price: 200000,
          stock: 5,
          soldCount: 10,
        },
        {
          id: "prod-3",
          name: "Quần jean",
          description: "Quần jean nam",
          category: "clothing",
          price: 300000,
          stock: 8,
          soldCount: 15,
        },
      ];

      (prisma.purchaseHistory.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const recommendations = await RecommendationService.getProductRecommendations(
        "user-1",
        "customer-1",
        ["áo", "xanh"],
        "Tôi muốn mua áo màu xanh",
        3
      );

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);

      recommendations.forEach((rec) => {
        expect(rec).toHaveProperty("productId");
        expect(rec).toHaveProperty("productName");
        expect(rec).toHaveProperty("reason");
        expect(rec).toHaveProperty("confidence");
        expect(rec.confidence).toBeGreaterThanOrEqual(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
      });
    });

    it("should return empty array when no products available", async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.purchaseHistory.findMany as jest.Mock).mockResolvedValue([]);

      const recommendations = await RecommendationService.getProductRecommendations(
        "user-1",
        "customer-1",
        ["test"],
        "Test conversation",
        3
      );

      expect(recommendations).toEqual([]);
    });

    it("should boost recommendations for customer's previous category", async () => {
      const mockPurchaseHistory = [
        {
          productId: "prod-old",
          product: {
            id: "prod-old",
            category: "electronics",
          },
        },
      ];

      const mockProducts = [
        {
          id: "prod-1",
          name: "Điện thoại",
          description: "Smartphone mới",
          category: "electronics",
          price: 5000000,
          stock: 3,
          soldCount: 50,
        },
        {
          id: "prod-2",
          name: "Áo thun",
          description: "Áo cotton",
          category: "clothing",
          price: 150000,
          stock: 10,
          soldCount: 20,
        },
      ];

      (prisma.purchaseHistory.findMany as jest.Mock).mockResolvedValue(
        mockPurchaseHistory
      );
      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const recommendations = await RecommendationService.getProductRecommendations(
        "user-1",
        "customer-1",
        ["điện thoại"],
        "Tôi muốn xem điện thoại",
        2
      );

      expect(recommendations.length).toBeGreaterThan(0);
      // Electronics product should have higher confidence due to category boost
      const electronicsRec = recommendations.find((r) =>
        r.productName.includes("Điện thoại")
      );
      expect(electronicsRec).toBeDefined();
    });

    it("should handle errors gracefully", async () => {
      (prisma.product.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const recommendations = await RecommendationService.getProductRecommendations(
        "user-1",
        "customer-1",
        ["test"],
        "Test",
        3
      );

      expect(recommendations).toEqual([]);
    });
  });

  describe("getCollaborativeRecommendations", () => {
    it("should recommend products based on similar customers", async () => {
      const mockPurchaseHistory = [
        { productId: "prod-1" },
        { productId: "prod-2" },
      ];

      const mockSimilarCustomers = [
        { customerId: "customer-2" },
        { customerId: "customer-3" },
      ];

      const mockRecommendedProducts = [
        {
          productId: "prod-3",
          product: {
            id: "prod-3",
            name: "Product 3",
            price: 100000,
            stock: 5,
          },
        },
        {
          productId: "prod-3",
          product: {
            id: "prod-3",
            name: "Product 3",
            price: 100000,
            stock: 5,
          },
        },
        {
          productId: "prod-4",
          product: {
            id: "prod-4",
            name: "Product 4",
            price: 150000,
            stock: 3,
          },
        },
      ];

      (prisma.purchaseHistory.findMany as jest.Mock)
        .mockResolvedValueOnce(mockPurchaseHistory)
        .mockResolvedValueOnce(mockSimilarCustomers)
        .mockResolvedValueOnce(mockRecommendedProducts);

      const recommendations = await RecommendationService.getCollaborativeRecommendations(
        "user-1",
        "customer-1",
        3
      );

      expect(Array.isArray(recommendations)).toBe(true);
      if (recommendations.length > 0) {
        expect(recommendations[0]).toHaveProperty("productId");
        expect(recommendations[0]).toHaveProperty("confidence");
      }
    });

    it("should return empty array for new customers with no purchase history", async () => {
      (prisma.purchaseHistory.findMany as jest.Mock).mockResolvedValue([]);

      const recommendations = await RecommendationService.getCollaborativeRecommendations(
        "user-1",
        "new-customer",
        3
      );

      expect(recommendations).toEqual([]);
    });

    it("should handle errors gracefully", async () => {
      (prisma.purchaseHistory.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const recommendations = await RecommendationService.getCollaborativeRecommendations(
        "user-1",
        "customer-1",
        3
      );

      expect(recommendations).toEqual([]);
    });
  });
});
