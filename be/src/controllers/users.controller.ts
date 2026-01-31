/**
 * Users Controller
 */

import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../utils/database";
import { AuthRequest } from "../types/api.types";
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES, USER_ROLES } from "../utils/constants";
import { AppError } from "../middleware/error.middleware";
import { ValidationService } from "../utils/validation";

const updateUserSchema = z.object({
  name: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

export class UsersController {
  /**
   * GET /api/users
   * Get all users (admin only)
   */
  public static async getUsers(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;
      const { page: validPage, limit: validLimit } = ValidationService.validatePagination(
        Number(page),
        Number(limit)
      );

      const skip = (validPage - 1) * validLimit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: validLimit,
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            role: true,
            planType: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count(),
      ]);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: users,
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
   * GET /api/users/:id
   * Get user by ID
   */
  public static async getUserById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          planType: true,
          subscriptionStatus: true,
          timezone: true,
          language: true,
          emailVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/:id
   * Update user
   */
  public static async updateUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const dto = updateUserSchema.parse(req.body);

      // Check if user can update this profile
      if (req.user?.userId !== id && req.user?.role !== USER_ROLES.ADMIN) {
        throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
      }

      const user = await prisma.user.update({
        where: { id },
        data: dto,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          timezone: true,
          language: true,
          updatedAt: true,
        },
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.USER_UPDATED,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id
   * Delete user (admin only)
   */
  public static async deleteUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id },
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.USER_DELETED,
      });
    } catch (error) {
      next(error);
    }
  }
}
