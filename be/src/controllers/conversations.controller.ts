/**
 * Conversations Controller
 */

import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../utils/database";
import { AuthRequest } from "../types/api.types";
import { HTTP_STATUS, ERROR_MESSAGES } from "../utils/constants";
import { AppError } from "../middleware/error.middleware";
import { ValidationService } from "../utils/validation";

const createConversationSchema = z.object({
  customerId: z.string(),
  integrationId: z.string(),
  platform: z.string(),
  platformThreadId: z.string(),
  status: z.string().optional(),
  priority: z.string().optional(),
});

const updateConversationSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  assignedAgentId: z.string().optional(),
  intent: z.string().optional(),
  sentiment: z.string().optional(),
});

export class ConversationsController {
  /**
   * GET /api/conversations
   */
  public static async getConversations(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { page = 1, limit = 20, status } = req.query;
      const { page: validPage, limit: validLimit } = ValidationService.validatePagination(
        Number(page),
        Number(limit)
      );

      const skip = (validPage - 1) * validLimit;

      const where: any = {
        customer: { userId },
      };

      if (status) {
        where.status = status;
      }

      const [conversations, total] = await Promise.all([
        prisma.conversation.findMany({
          where,
          skip,
          take: validLimit,
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            assignedAgent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { lastMessageAt: "desc" },
        }),
        prisma.conversation.count({ where }),
      ]);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: conversations,
        pagination: {
          page: validPage,
          limit: validLimit,
          total,
          totalPages: Math.ceil(total / validLimit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/conversations/:id
   */
  public static async getConversationById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          customer: { userId },
        },
        include: {
          customer: true,
          assignedAgent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          messages: {
            orderBy: { sentAt: "asc" },
            include: {
              attachments: true,
            },
          },
          aiSuggestions: {
            where: { isUsed: false },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      });

      if (!conversation) {
        throw new AppError(ERROR_MESSAGES.CONVERSATION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/conversations
   */
  public static async createConversation(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto = createConversationSchema.parse(req.body);

      const conversation = await prisma.conversation.create({
        data: dto,
        include: {
          customer: true,
        },
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/conversations/:id/status
   */
  public static async updateConversationStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const conversation = await prisma.conversation.update({
        where: { id },
        data: { status },
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/conversations/:id/assign
   */
  public static async assignConversation(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { assignedAgentId } = req.body;

      const conversation = await prisma.conversation.update({
        where: { id },
        data: { assignedAgentId },
        include: {
          assignedAgent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/conversations/:id/messages
   * Send a message in a conversation
   */
  public static async sendMessage(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const userId = req.user!.userId;

      if (!message || typeof message !== "string" || message.trim().length === 0) {
        throw new AppError("Nội dung tin nhắn không được để trống", HTTP_STATUS.BAD_REQUEST);
      }

      const { MessageSyncService } = require("../services/message-sync.service");
      const sentMessage = await MessageSyncService.sendMessageToCustomer(
        id,
        userId,
        message.trim()
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: sentMessage,
      });
    } catch (error) {
      next(error);
    }
  }
}
