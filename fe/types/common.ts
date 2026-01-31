/**
 * Common Frontend Type Definitions
 * (Frontend-specific types and API response wrappers)
 */

import { JwtPayload } from "./api/auth";

/**
 * API Response wrappers (from backend)
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}

/**
 * Frontend-specific types
 */

export interface AuthState {
  user: JwtPayload | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export type Platform = "facebook" | "shopee" | "tiktok" | "lazada";
export type ConversationStatus = "open" | "pending" | "resolved" | "closed";
export type ConversationPriority = "low" | "normal" | "high" | "urgent";
export type CustomerSegment = "vip" | "regular" | "potential" | "churned";
