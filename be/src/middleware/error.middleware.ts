/**
 * Error Handling Middleware
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { HTTP_STATUS, ERROR_MESSAGES } from "../utils/constants";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  public constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.error(`${err.message}`, { path: req.path, method: req.method });
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      statusCode: err.statusCode,
    });
    return;
  }

  // Unhandled errors
  logger.error(`Unhandled error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: ERROR_MESSAGES.INTERNAL_ERROR,
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: ERROR_MESSAGES.NOT_FOUND,
    statusCode: HTTP_STATUS.NOT_FOUND,
  });
};
