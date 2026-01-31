/**
 * AI Controller
 * Handles AI-powered features: conversation analysis, recommendations, suggestions
 */

import { Response, NextFunction } from "express";
import { prisma } from "../utils/database";
import { AuthRequest } from "../types/api.types";
import { HTTP_STATUS } from "../utils/constants";
import { AppError } from "../middleware/error.middleware";
import { OpenAIService } from "../services/openai.service";
import { RecommendationService } from "../services/recommendation.service";
import { logger } from "../utils/logger";
import { AiSuggestionResponse } from "../types/ai.types";

export class AiController {
  /**
   * GET /api/conversations/:id/ai-suggestions
   * Get AI-powered suggestions for a conversation
   */
  public static async getConversationSuggestions(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: conversationId } = req.params;
      const userId = req.user!.userId;

      // Get conversation with messages and customer info
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
        include: {
          messages: {
            orderBy: { sentAt: "asc" },
            take: 20, // Last 20 messages for context
          },
          customer: true,
        },
      });

      if (!conversation) {
        throw new AppError("Không tìm thấy cuộc hội thoại", HTTP_STATUS.NOT_FOUND);
      }

      // Check if we have recent suggestions (within last hour)
      const recentSuggestion = await prisma.aiSuggestion.findFirst({
        where: {
          conversationId,
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (recentSuggestion) {
        logger.info("Returning cached AI suggestions");
        res.status(HTTP_STATUS.OK).json({
          success: true,
          data: {
            ...recentSuggestion,
            cached: true,
          },
        });
        return;
      }

      // Build conversation text
      const conversationText = conversation.messages
        .map((msg) => `${msg.senderType === "customer" ? "Khách" : "Nhân viên"}: ${msg.content}`)
        .join("\n");

      if (!conversationText || conversationText.trim().length === 0) {
        throw new AppError(
          "Cuộc hội thoại chưa có nội dung để phân tích",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Analyze conversation with AI
      const analysis = await OpenAIService.analyzeConversation(
        conversationText,
        conversation.customer.name || undefined
      );

      // Get product recommendations
      const productRecommendations = await RecommendationService.getProductRecommendations(
        userId,
        conversation.customerId,
        analysis.keywords,
        conversationText,
        3
      );

      // Generate response suggestions
      const responseSuggestions = await OpenAIService.generateResponseSuggestions(
        conversationText,
        conversation.customer.name || "Khách hàng",
        analysis.intent as any,
        analysis.sentiment
      );

      // Save suggestions to database
      const aiSuggestion = await prisma.aiSuggestion.create({
        data: {
          conversationId,
          suggestionType: "response",
          content: JSON.stringify({
            analysis,
            productRecommendations,
            responseSuggestions,
          }),
          confidence: analysis.purchaseProbability,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        },
      });

      // Update conversation with AI insights
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          aiIntent: analysis.intent,
          aiSentiment: analysis.sentiment,
          aiPurchaseProbability: analysis.purchaseProbability,
          aiUrgencyLevel: analysis.urgencyLevel,
        },
      });

      const response: AiSuggestionResponse = {
        conversationId,
        analysis,
        productRecommendations,
        responseSuggestions: responseSuggestions.map((text, index) => ({
          text,
          type: index === 0 ? "greeting" : index === responseSuggestions.length - 1 ? "closing" : "support",
          confidence: 0.8,
          context: analysis.intent,
        })),
        generatedAt: aiSuggestion.createdAt,
        expiresAt: aiSuggestion.expiresAt!,
      };

      logger.info(`AI suggestions generated for conversation ${conversationId}`);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ai/suggestions/:id/feedback
   * Provide feedback on AI suggestion
   */
  public static async provideFeedback(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: suggestionId } = req.params;
      const { adopted, helpful, feedback } = req.body;

      const suggestion = await prisma.aiSuggestion.findUnique({
        where: { id: suggestionId },
      });

      if (!suggestion) {
        throw new AppError("Không tìm thấy gợi ý AI", HTTP_STATUS.NOT_FOUND);
      }

      // Update suggestion with feedback
      await prisma.aiSuggestion.update({
        where: { id: suggestionId },
        data: {
          wasAdopted: adopted === true,
          feedback: feedback || null,
        },
      });

      logger.info(`Feedback recorded for AI suggestion ${suggestionId}`);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Cảm ơn phản hồi của bạn",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ai/analytics
   * Get AI performance analytics
   */
  public static async getAnalytics(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;

      // Get suggestion adoption rate
      const totalSuggestions = await prisma.aiSuggestion.count({
        where: {
          conversation: {
            userId,
          },
        },
      });

      const adoptedSuggestions = await prisma.aiSuggestion.count({
        where: {
          conversation: {
            userId,
          },
          wasAdopted: true,
        },
      });

      const adoptionRate =
        totalSuggestions > 0 ? adoptedSuggestions / totalSuggestions : 0;

      // Get intent distribution
      const intentDistribution = await prisma.conversation.groupBy({
        by: ["aiIntent"],
        where: {
          userId,
          aiIntent: { not: null },
        },
        _count: true,
      });

      // Get sentiment distribution
      const sentimentDistribution = await prisma.conversation.groupBy({
        by: ["aiSentiment"],
        where: {
          userId,
          aiSentiment: { not: null },
        },
        _count: true,
      });

      // Get average purchase probability
      const avgPurchaseProbability = await prisma.conversation.aggregate({
        where: {
          userId,
          aiPurchaseProbability: { not: null },
        },
        _avg: {
          aiPurchaseProbability: true,
        },
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          adoptionRate: Math.round(adoptionRate * 100) / 100,
          totalSuggestions,
          adoptedSuggestions,
          intentDistribution,
          sentimentDistribution,
          averagePurchaseProbability: avgPurchaseProbability._avg.aiPurchaseProbability || 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/recommendations/:customerId
   * Get product recommendations for a customer
   */
  public static async getCustomerRecommendations(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { customerId } = req.params;
      const userId = req.user!.userId;
      const { limit = 5 } = req.query;

      // Verify customer belongs to user
      const customer = await prisma.customer.findFirst({
        where: {
          id: customerId,
          userId,
        },
      });

      if (!customer) {
        throw new AppError("Không tìm thấy khách hàng", HTTP_STATUS.NOT_FOUND);
      }

      // Get collaborative filtering recommendations
      const recommendations = await RecommendationService.getCollaborativeRecommendations(
        userId,
        customerId,
        Number(limit)
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      next(error);
    }
  }
}
