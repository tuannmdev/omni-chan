/**
 * Authentication Middleware
 */

import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/api.types";
import { JwtPayload } from "../types/auth.types";
import { AppError } from "./error.middleware";
import { HTTP_STATUS, ERROR_MESSAGES, USER_ROLES } from "../utils/constants";
import { logger } from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export class AuthMiddleware {
  /**
   * Verify JWT token and attach user to request
   */
  public static authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }

      const token = authHeader.substring(7);

      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      req.user = decoded;

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        next(new AppError(ERROR_MESSAGES.TOKEN_EXPIRED, HTTP_STATUS.UNAUTHORIZED));
      } else if (error instanceof jwt.JsonWebTokenError) {
        next(new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
      } else {
        next(error);
      }
    }
  }

  /**
   * Check if user has required role
   */
  public static authorize(...allowedRoles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        next(new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(`Unauthorized access attempt by user ${req.user.userId} to ${req.path}`);
        next(new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
        return;
      }

      next();
    };
  }

  /**
   * Optional authentication - attach user if token exists
   */
  public static optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        req.user = decoded;
      }

      next();
    } catch (error) {
      // Ignore errors for optional auth
      next();
    }
  }
}
