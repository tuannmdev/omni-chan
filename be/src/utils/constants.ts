/**
 * Application Constants
 * Centralized location for all application-wide constants
 */

// User Roles
export const USER_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  AGENT: "agent",
} as const;

// Plan Types
export const PLAN_TYPES = {
  FREE: "free",
  STARTER: "starter",
  PROFESSIONAL: "professional",
  ENTERPRISE: "enterprise",
} as const;

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  CANCELLED: "cancelled",
} as const;

// Platform Types
export const PLATFORMS = {
  FACEBOOK: "facebook",
  SHOPEE: "shopee",
  TIKTOK: "tiktok",
  LAZADA: "lazada",
} as const;

// Conversation Status
export const CONVERSATION_STATUS = {
  OPEN: "open",
  PENDING: "pending",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

// Conversation Priority
export const CONVERSATION_PRIORITY = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
} as const;

// Message Sender Types
export const SENDER_TYPES = {
  CUSTOMER: "customer",
  AGENT: "agent",
  SYSTEM: "system",
  AI: "ai",
} as const;

// Message Content Types
export const CONTENT_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  FILE: "file",
  AUDIO: "audio",
  VIDEO: "video",
} as const;

// AI Suggestion Types
export const AI_SUGGESTION_TYPES = {
  PRODUCT_RECOMMENDATION: "product_recommendation",
  RESPONSE_TEMPLATE: "response_template",
  ACTION_SUGGESTION: "action_suggestion",
} as const;

// Intent Types
export const INTENT_TYPES = {
  PRODUCT_INQUIRY: "product_inquiry",
  SUPPORT: "support",
  COMPLAINT: "complaint",
  GENERAL: "general",
} as const;

// Sentiment Types
export const SENTIMENT_TYPES = {
  POSITIVE: "positive",
  NEUTRAL: "neutral",
  NEGATIVE: "negative",
} as const;

// Customer Segments
export const CUSTOMER_SEGMENTS = {
  VIP: "vip",
  REGULAR: "regular",
  POTENTIAL: "potential",
  CHURNED: "churned",
} as const;

// Sync Status
export const SYNC_STATUS = {
  PENDING: "pending",
  SYNCING: "syncing",
  SYNCED: "synced",
  ERROR: "error",
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không chính xác",
  UNAUTHORIZED: "Bạn chưa đăng nhập",
  FORBIDDEN: "Bạn không có quyền truy cập",
  TOKEN_EXPIRED: "Phiên đăng nhập đã hết hạn",

  // User
  USER_NOT_FOUND: "Không tìm thấy người dùng",
  EMAIL_ALREADY_EXISTS: "Email đã được sử dụng",
  INVALID_EMAIL: "Email không hợp lệ",
  WEAK_PASSWORD: "Mật khẩu phải có ít nhất 8 ký tự",

  // Customer
  CUSTOMER_NOT_FOUND: "Không tìm thấy khách hàng",

  // Conversation
  CONVERSATION_NOT_FOUND: "Không tìm thấy cuộc hội thoại",

  // Integration
  INTEGRATION_NOT_FOUND: "Không tìm thấy kết nối",
  INTEGRATION_FAILED: "Kết nối thất bại",

  // General
  INTERNAL_ERROR: "Đã có lỗi xảy ra, vui lòng thử lại",
  VALIDATION_ERROR: "Dữ liệu không hợp lệ",
  NOT_FOUND: "Không tìm thấy tài nguyên",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_CREATED: "Tạo tài khoản thành công",
  USER_UPDATED: "Cập nhật thông tin thành công",
  USER_DELETED: "Xóa người dùng thành công",
  LOGIN_SUCCESS: "Đăng nhập thành công",
  LOGOUT_SUCCESS: "Đăng xuất thành công",
  INTEGRATION_SUCCESS: "Kết nối thành công",
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// JWT
export const JWT = {
  ACCESS_TOKEN_EXPIRY: "24h",
  REFRESH_TOKEN_EXPIRY: "7d",
} as const;

// Rate Limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
} as const;

// AI Configuration
export const AI_CONFIG = {
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 1000,
  CONFIDENCE_THRESHOLD: 0.7,
  SUGGESTION_EXPIRY_HOURS: 1,
} as const;
