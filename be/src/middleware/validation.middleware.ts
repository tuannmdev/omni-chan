/**
 * Request Validation Middleware
 */

import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { AppError } from "./error.middleware";
import { HTTP_STATUS, ERROR_MESSAGES } from "../utils/constants";

export class ValidationMiddleware {
  /**
   * Validate request body against Zod schema
   */
  public static validateBody<T>(schema: ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessage = error.errors.map((err) => err.message).join(", ");
          next(new AppError(errorMessage, HTTP_STATUS.UNPROCESSABLE_ENTITY));
        } else {
          next(new AppError(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST));
        }
      }
    };
  }

  /**
   * Validate request query parameters
   */
  public static validateQuery<T>(schema: ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        schema.parse(req.query);
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessage = error.errors.map((err) => err.message).join(", ");
          next(new AppError(errorMessage, HTTP_STATUS.UNPROCESSABLE_ENTITY));
        } else {
          next(new AppError(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST));
        }
      }
    };
  }

  /**
   * Validate request params
   */
  public static validateParams<T>(schema: ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        schema.parse(req.params);
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessage = error.errors.map((err) => err.message).join(", ");
          next(new AppError(errorMessage, HTTP_STATUS.UNPROCESSABLE_ENTITY));
        } else {
          next(new AppError(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST));
        }
      }
    };
  }
}
