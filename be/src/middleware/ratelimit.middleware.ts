/**
 * Rate Limiting Middleware
 */

import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../utils/constants";
import { logger } from "../utils/logger";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;

  public constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (this.store[key]!.resetTime < now) {
        delete this.store[key];
      }
    });
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const key = req.ip || req.socket.remoteAddress || "unknown";
      const now = Date.now();

      if (!this.store[key] || this.store[key]!.resetTime < now) {
        this.store[key] = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        next();
        return;
      }

      this.store[key]!.count++;

      if (this.store[key]!.count > this.maxRequests) {
        logger.warn(`Rate limit exceeded for IP: ${key}`);
        res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
          success: false,
          error: "Quá nhiều yêu cầu, vui lòng thử lại sau",
          retryAfter: Math.ceil((this.store[key]!.resetTime - now) / 1000),
        });
        return;
      }

      next();
    };
  }
}

export const rateLimiter = new RateLimiter();
