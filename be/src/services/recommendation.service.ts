/**
 * Product Recommendation Service
 * AI-powered product recommendations based on conversation context
 */

import { prisma } from "../utils/database";
import { logger } from "../utils/logger";
import { ProductRecommendation } from "../types/ai.types";
import { OpenAIService } from "./openai.service";

export class RecommendationService {
  /**
   * Get product recommendations based on conversation keywords and customer history
   */
  public static async getProductRecommendations(
    userId: string,
    customerId: string,
    keywords: string[],
    conversationText: string,
    limit: number = 3
  ): Promise<ProductRecommendation[]> {
    try {
      // Get customer's purchase history
      const purchaseHistory = await prisma.purchaseHistory.findMany({
        where: { customerId },
        include: {
          product: true,
        },
        orderBy: { orderedAt: "desc" },
        take: 5,
      });

      // Get all available products
      const products = await prisma.product.findMany({
        where: {
          userId,
          stock: { gt: 0 }, // Only products in stock
        },
        take: 20,
        orderBy: { createdAt: "desc" },
      });

      if (products.length === 0) {
        logger.info("No products available for recommendations");
        return [];
      }

      // Score products based on keywords and context
      const scoredProducts = products.map((product) => {
        let score = 0;

        // Match keywords with product name and description
        keywords.forEach((keyword) => {
          const lowerKeyword = keyword.toLowerCase();
          const productName = product.name.toLowerCase();
          const productDesc = (product.description || "").toLowerCase();

          if (productName.includes(lowerKeyword)) {
            score += 3; // High relevance
          }
          if (productDesc.includes(lowerKeyword)) {
            score += 1; // Medium relevance
          }
        });

        // Boost score if customer has purchased similar products
        const hasPurchasedCategory = purchaseHistory.some(
          (ph) => ph.product?.category === product.category
        );
        if (hasPurchasedCategory) {
          score += 2;
        }

        // Boost popular products
        if (product.soldCount && product.soldCount > 10) {
          score += 1;
        }

        return {
          product,
          score,
        };
      });

      // Sort by score and take top N
      const topProducts = scoredProducts
        .filter((sp) => sp.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      // Generate recommendations with reasons
      const recommendations: ProductRecommendation[] = await Promise.all(
        topProducts.map(async ({ product, score }) => {
          const reason = await this.generateRecommendationReason(
            product.name,
            keywords,
            conversationText
          );

          return {
            productId: product.id,
            productName: product.name,
            reason,
            confidence: Math.min(score / 10, 1), // Normalize to 0-1
            price: product.price,
            available: product.stock > 0,
          };
        })
      );

      logger.info(`Generated ${recommendations.length} product recommendations`);
      return recommendations;
    } catch (error) {
      logger.error("Error generating product recommendations:", error);
      return [];
    }
  }

  /**
   * Generate recommendation reason using AI
   */
  private static async generateRecommendationReason(
    productName: string,
    keywords: string[],
    conversationText: string
  ): Promise<string> {
    try {
      const prompt = `Tạo một câu ngắn gọn (tối đa 100 ký tự) giải thích tại sao sản phẩm "${productName}" phù hợp với khách hàng dựa trên cuộc hội thoại.

Từ khóa: ${keywords.join(", ")}
Cuộc hội thoại: ${conversationText.substring(0, 200)}...

Lý do (một câu ngắn):`;

      const response = await OpenAIService["callOpenAI"](prompt, 0.7, 100);
      return response.substring(0, 150); // Limit length
    } catch (error) {
      logger.debug("Could not generate AI reason, using default");
      return `Phù hợp với nhu cầu của bạn`;
    }
  }

  /**
   * Get recommendations based on customer's purchase history
   */
  public static async getCollaborativeRecommendations(
    userId: string,
    customerId: string,
    limit: number = 3
  ): Promise<ProductRecommendation[]> {
    try {
      // Get customer's purchased products
      const purchasedProducts = await prisma.purchaseHistory.findMany({
        where: { customerId },
        select: { productId: true },
      });

      const purchasedProductIds = purchasedProducts.map((p) => p.productId);

      if (purchasedProductIds.length === 0) {
        return [];
      }

      // Find other customers who bought similar products
      const similarCustomers = await prisma.purchaseHistory.findMany({
        where: {
          productId: { in: purchasedProductIds },
          customerId: { not: customerId },
        },
        select: {
          customerId: true,
        },
        distinct: ["customerId"],
        take: 10,
      });

      const similarCustomerIds = similarCustomers.map((c) => c.customerId);

      if (similarCustomerIds.length === 0) {
        return [];
      }

      // Get products that similar customers bought but this customer hasn't
      const recommendedProducts = await prisma.purchaseHistory.findMany({
        where: {
          customerId: { in: similarCustomerIds },
          productId: { notIn: purchasedProductIds },
        },
        include: {
          product: true,
        },
        take: limit * 2,
      });

      // Count frequency and create recommendations
      const productFrequency: { [key: string]: number } = {};
      recommendedProducts.forEach((rp) => {
        if (rp.productId) {
          productFrequency[rp.productId] =
            (productFrequency[rp.productId] || 0) + 1;
        }
      });

      const recommendations: ProductRecommendation[] = Object.entries(
        productFrequency
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([productId, frequency]) => {
          const product = recommendedProducts.find(
            (rp) => rp.productId === productId
          )?.product;

          if (!product) {
            return null;
          }

          return {
            productId: product.id,
            productName: product.name,
            reason: "Khách hàng tương tự đã mua sản phẩm này",
            confidence: Math.min(frequency / 5, 1),
            price: product.price,
            available: product.stock > 0,
          };
        })
        .filter((r): r is ProductRecommendation => r !== null);

      return recommendations;
    } catch (error) {
      logger.error("Error generating collaborative recommendations:", error);
      return [];
    }
  }
}
