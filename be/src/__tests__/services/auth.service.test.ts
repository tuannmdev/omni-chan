/**
 * Unit Tests for Authentication Service
 */

import jwt from "jsonwebtoken";
import { AuthService } from "../../services/auth.service";
import { prisma } from "../../utils/database";
import { EncryptionService } from "../../utils/encryption";
import { AppError } from "../../middleware/error.middleware";
import { HTTP_STATUS, ERROR_MESSAGES, USER_ROLES } from "../../utils/constants";

// Mock dependencies
jest.mock("../../utils/database", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("../../utils/encryption");
jest.mock("../../utils/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    const validRegisterDto = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    };

    it("should register a new user successfully", async () => {
      const mockUser = {
        id: "user-123",
        email: validRegisterDto.email,
        name: validRegisterDto.name,
        role: USER_ROLES.OWNER,
      };

      (EncryptionService.hashPassword as jest.Mock).mockResolvedValue("hashed-password");
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.register(validRegisterDto);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user.email).toBe(validRegisterDto.email);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: validRegisterDto.email,
          passwordHash: "hashed-password",
          name: validRegisterDto.name,
          role: USER_ROLES.OWNER,
        },
        select: expect.any(Object),
      });
    });

    it("should throw error for invalid email", async () => {
      const invalidDto = { ...validRegisterDto, email: "invalid-email" };

      await expect(AuthService.register(invalidDto)).rejects.toThrow(AppError);
      await expect(AuthService.register(invalidDto)).rejects.toMatchObject({
        message: ERROR_MESSAGES.INVALID_EMAIL,
        statusCode: HTTP_STATUS.BAD_REQUEST,
      });
    });

    it("should throw error for weak password", async () => {
      const weakPasswordDto = { ...validRegisterDto, password: "123" };

      await expect(AuthService.register(weakPasswordDto)).rejects.toThrow(AppError);
      await expect(AuthService.register(weakPasswordDto)).rejects.toMatchObject({
        message: ERROR_MESSAGES.WEAK_PASSWORD,
        statusCode: HTTP_STATUS.BAD_REQUEST,
      });
    });

    it("should throw error if email already exists", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "existing-user",
        email: validRegisterDto.email,
      });

      await expect(AuthService.register(validRegisterDto)).rejects.toThrow(AppError);
      await expect(AuthService.register(validRegisterDto)).rejects.toMatchObject({
        message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
        statusCode: HTTP_STATUS.CONFLICT,
      });
    });

    it("should use custom role if provided", async () => {
      const mockUser = {
        id: "user-123",
        email: validRegisterDto.email,
        name: validRegisterDto.name,
        role: USER_ROLES.AGENT,
      };

      (EncryptionService.hashPassword as jest.Mock).mockResolvedValue("hashed-password");
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const dtoWithRole = { ...validRegisterDto, role: USER_ROLES.AGENT };
      await AuthService.register(dtoWithRole);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          role: USER_ROLES.AGENT,
        }),
        select: expect.any(Object),
      });
    });
  });

  describe("login", () => {
    const validLoginDto = {
      email: "test@example.com",
      password: "password123",
    };

    const mockUser = {
      id: "user-123",
      email: validLoginDto.email,
      name: "Test User",
      role: USER_ROLES.OWNER,
      passwordHash: "hashed-password",
      isActive: true,
    };

    it("should login user successfully", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (EncryptionService.comparePassword as jest.Mock).mockResolvedValue(true);
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await AuthService.login(validLoginDto);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user.email).toBe(validLoginDto.email);
      expect(result.user).not.toHaveProperty("passwordHash");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { lastLoginAt: expect.any(Date) },
      });
    });

    it("should throw error for non-existent user", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.login(validLoginDto)).rejects.toThrow(AppError);
      await expect(AuthService.login(validLoginDto)).rejects.toMatchObject({
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      });
    });

    it("should throw error for inactive user", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(AuthService.login(validLoginDto)).rejects.toThrow(AppError);
      await expect(AuthService.login(validLoginDto)).rejects.toMatchObject({
        message: "Tài khoản đã bị vô hiệu hóa",
        statusCode: HTTP_STATUS.FORBIDDEN,
      });
    });

    it("should throw error for invalid password", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (EncryptionService.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(AuthService.login(validLoginDto)).rejects.toThrow(AppError);
      await expect(AuthService.login(validLoginDto)).rejects.toMatchObject({
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      });
    });

    it("should throw error if user has no password hash", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        passwordHash: null,
      });

      await expect(AuthService.login(validLoginDto)).rejects.toThrow(AppError);
      await expect(AuthService.login(validLoginDto)).rejects.toMatchObject({
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      });
    });
  });

  describe("refreshAccessToken", () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      role: USER_ROLES.OWNER,
      isActive: true,
    };

    it("should refresh access token successfully", async () => {
      const validRefreshToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        process.env.JWT_REFRESH_SECRET || "your-refresh-secret"
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.refreshAccessToken(validRefreshToken);

      expect(result).toHaveProperty("accessToken");
      expect(typeof result.accessToken).toBe("string");
    });

    it("should throw error for expired refresh token", async () => {
      const expiredToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
        { expiresIn: "-1h" }
      );

      await expect(AuthService.refreshAccessToken(expiredToken)).rejects.toThrow(AppError);
      await expect(AuthService.refreshAccessToken(expiredToken)).rejects.toMatchObject({
        message: ERROR_MESSAGES.TOKEN_EXPIRED,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      });
    });

    it("should throw error for invalid refresh token", async () => {
      const invalidToken = "invalid-token-string";

      await expect(AuthService.refreshAccessToken(invalidToken)).rejects.toThrow(AppError);
    });

    it("should throw error if user no longer exists", async () => {
      const validRefreshToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        process.env.JWT_REFRESH_SECRET || "your-refresh-secret"
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.refreshAccessToken(validRefreshToken)).rejects.toThrow(AppError);
      await expect(AuthService.refreshAccessToken(validRefreshToken)).rejects.toMatchObject({
        message: ERROR_MESSAGES.UNAUTHORIZED,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      });
    });

    it("should throw error if user is inactive", async () => {
      const validRefreshToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        process.env.JWT_REFRESH_SECRET || "your-refresh-secret"
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(AuthService.refreshAccessToken(validRefreshToken)).rejects.toThrow(AppError);
    });
  });

  describe("getCurrentUser", () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      avatarUrl: null,
      role: USER_ROLES.OWNER,
      planType: "free",
      subscriptionStatus: "active",
      timezone: "Asia/Ho_Chi_Minh",
      language: "vi",
      emailVerified: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should get current user successfully", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.getCurrentUser(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: expect.any(Object),
      });
    });

    it("should throw error if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.getCurrentUser("non-existent-id")).rejects.toThrow(AppError);
      await expect(AuthService.getCurrentUser("non-existent-id")).rejects.toMatchObject({
        message: ERROR_MESSAGES.USER_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND,
      });
    });
  });

  describe("JWT token generation", () => {
    it("should generate valid access token", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        role: USER_ROLES.OWNER,
      };

      (EncryptionService.hashPassword as jest.Mock).mockResolvedValue("hashed-password");
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.register({
        email: mockUser.email,
        password: "password123",
        name: mockUser.name,
      });

      const decoded = jwt.verify(
        result.accessToken,
        process.env.JWT_SECRET || "your-secret-key"
      ) as any;

      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });

    it("should generate valid refresh token", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        role: USER_ROLES.OWNER,
      };

      (EncryptionService.hashPassword as jest.Mock).mockResolvedValue("hashed-password");
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.register({
        email: mockUser.email,
        password: "password123",
        name: mockUser.name,
      });

      const decoded = jwt.verify(
        result.refreshToken,
        process.env.JWT_REFRESH_SECRET || "your-refresh-secret"
      ) as any;

      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });
  });
});
