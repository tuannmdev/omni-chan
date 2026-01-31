/**
 * Integration Tests for Authentication Endpoints
 */

import request from "supertest";
import app from "../../app";
import { prisma } from "../../utils/database";
import { EncryptionService } from "../../utils/encryption";
import { USER_ROLES, HTTP_STATUS } from "../../utils/constants";

// Mock database
jest.mock("../../utils/database", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
  databaseHealthCheck: jest.fn().mockResolvedValue(true),
}));

describe("Auth Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const newUser = {
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
      };

      const mockCreatedUser = {
        id: "user-123",
        email: newUser.email,
        name: newUser.name,
        role: USER_ROLES.OWNER,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      const response = await request(app)
        .post("/api/auth/register")
        .send(newUser);

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data.user.email).toBe(newUser.email);
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          // Missing password
        });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.success).toBe(false);
    });

    it("should return 409 for duplicate email", async () => {
      const existingUser = {
        id: "user-123",
        email: "existing@example.com",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: existingUser.email,
          password: "password123",
          name: "Test User",
        });

      expect(response.status).toBe(HTTP_STATUS.CONFLICT);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for invalid email format", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "invalid-email",
          password: "password123",
          name: "Test User",
        });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for weak password", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          password: "123", // Too short
          name: "Test User",
        });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login user successfully", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const mockUser = {
        id: "user-123",
        email: loginData.email,
        name: "Test User",
        role: USER_ROLES.OWNER,
        passwordHash: await EncryptionService.hashPassword(loginData.password),
        isActive: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data.user).not.toHaveProperty("passwordHash");
    });

    it("should return 401 for invalid credentials", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        });

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
    });

    it("should return 403 for inactive user", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        passwordHash: await EncryptionService.hashPassword("password123"),
        isActive: false,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          // Missing password
        });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should refresh access token successfully", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        role: USER_ROLES.OWNER,
        isActive: true,
      };

      // Generate a valid refresh token
      const jwt = require("jsonwebtoken");
      const refreshToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
        { expiresIn: "7d" }
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
    });

    it("should return 401 for invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "invalid-token" });

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for missing refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({});

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should get current user info with valid token", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        role: USER_ROLES.OWNER,
        planType: "free",
        subscriptionStatus: "active",
        timezone: "Asia/Ho_Chi_Minh",
        language: "vi",
        emailVerified: false,
        isActive: true,
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Generate a valid access token
      const jwt = require("jsonwebtoken");
      const accessToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(mockUser.email);
    });

    it("should return 401 without authentication token", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 for invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully (stateless, always returns success)", async () => {
      const response = await request(app).post("/api/auth/logout");

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
    });
  });

  describe("Rate Limiting", () => {
    it("should enforce rate limiting on auth endpoints", async () => {
      const requests = [];
      const maxRequests = 105; // Slightly above the limit

      // Make many requests rapidly
      for (let i = 0; i < maxRequests; i++) {
        requests.push(
          request(app)
            .post("/api/auth/login")
            .send({
              email: "test@example.com",
              password: "password123",
            })
        );
      }

      const responses = await Promise.all(requests);
      const tooManyRequestsResponses = responses.filter(
        (r) => r.status === HTTP_STATUS.TOO_MANY_REQUESTS
      );

      // At least some requests should be rate limited
      expect(tooManyRequestsResponses.length).toBeGreaterThan(0);
    });
  });
});
