/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service";
import { AuthRequest } from "../types/api.types";
import { HTTP_STATUS, SUCCESS_MESSAGES } from "../utils/constants";

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  name: z.string().optional(),
  role: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token không được để trống"),
});

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  public static async register(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto = registerSchema.parse(req.body);
      const result = await AuthService.register(dto);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.USER_CREATED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Login user
   */
  public static async login(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto = loginSchema.parse(req.body);
      const result = await AuthService.login(dto);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  public static async refresh(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const result = await AuthService.refreshAccessToken(refreshToken);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Get current user
   */
  public static async getCurrentUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      const user = await AuthService.getCurrentUser(req.user.userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Logout user (client-side token removal)
   */
  public static async logout(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  }
}
