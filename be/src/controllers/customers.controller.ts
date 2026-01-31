/**
 * Customers Controller
 */

import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../utils/database";
import { AuthRequest } from "../types/api.types";
import { HTTP_STATUS, ERROR_MESSAGES } from "../utils/constants";
import { AppError } from "../middleware/error.middleware";
import { ValidationService } from "../utils/validation";

const createCustomerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  facebookId: z.string().optional(),
  shopeeId: z.string().optional(),
});

const updateCustomerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  customerSegment: z.string().optional(),
});

export class CustomersController {
  /**
   * GET /api/customers
   */
  public static async getCustomers(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { page = 1, limit = 20 } = req.query;
      const { page: validPage, limit: validLimit } = ValidationService.validatePagination(
        Number(page),
        Number(limit)
      );

      const skip = (validPage - 1) * validLimit;

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where: { userId },
          skip,
          take: validLimit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.customer.count({ where: { userId } }),
      ]);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: customers,
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
   * GET /api/customers/:id
   */
  public static async getCustomerById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const customer = await prisma.customer.findFirst({
        where: { id, userId },
        include: {
          conversations: {
            take: 10,
            orderBy: { lastMessageAt: "desc" },
          },
          purchaseHistory: {
            take: 10,
            orderBy: { orderedAt: "desc" },
          },
        },
      });

      if (!customer) {
        throw new AppError(ERROR_MESSAGES.CUSTOMER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/customers
   */
  public static async createCustomer(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const dto = createCustomerSchema.parse(req.body);

      const customer = await prisma.customer.create({
        data: {
          ...dto,
          userId,
        },
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/customers/:id
   */
  public static async updateCustomer(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const dto = updateCustomerSchema.parse(req.body);

      const customer = await prisma.customer.updateMany({
        where: { id, userId },
        data: dto,
      });

      if (customer.count === 0) {
        throw new AppError(ERROR_MESSAGES.CUSTOMER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const updated = await prisma.customer.findUnique({ where: { id } });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/customers/:id
   */
  public static async deleteCustomer(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const result = await prisma.customer.deleteMany({
        where: { id, userId },
      });

      if (result.count === 0) {
        throw new AppError(ERROR_MESSAGES.CUSTOMER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Xóa khách hàng thành công",
      });
    } catch (error) {
      next(error);
    }
  }
}
