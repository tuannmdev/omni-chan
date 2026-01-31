/**
 * Unit Tests for Facebook Service
 */

import axios from "axios";
import { FacebookService } from "../../services/facebook.service";
import { prisma } from "../../utils/database";
import { EncryptionService } from "../../utils/encryption";
import { AppError } from "../../middleware/error.middleware";

// Mock dependencies
jest.mock("axios");
jest.mock("../../utils/database", () => ({
  prisma: {
    integration: {
      findFirst: jest.fn(),
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

describe("FacebookService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("exchangeCodeForToken", () => {
    it("should exchange authorization code for access token", async () => {
      const mockResponse = {
        data: {
          access_token: "test_access_token",
          token_type: "bearer",
          expires_in: 5184000,
        },
      };

      (axios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await FacebookService.exchangeCodeForToken(
        "auth_code_123",
        "http://localhost:3000/callback"
      );

      expect(result.access_token).toBe("test_access_token");
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/oauth/access_token"),
        expect.any(Object)
      );
    });

    it("should throw error on Facebook OAuth failure", async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error("Facebook API error"));

      await expect(
        FacebookService.exchangeCodeForToken("invalid_code", "http://localhost:3000")
      ).rejects.toThrow(AppError);
    });
  });

  describe("getLongLivedToken", () => {
    it("should exchange short-lived token for long-lived token", async () => {
      const mockResponse = {
        data: {
          access_token: "long_lived_token",
        },
      };

      (axios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await FacebookService.getLongLivedToken("short_lived_token");

      expect(result).toBe("long_lived_token");
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/oauth/access_token"),
        expect.objectContaining({
          params: expect.objectContaining({
            grant_type: "fb_exchange_token",
          }),
        })
      );
    });

    it("should throw error if token exchange fails", async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error("Token exchange failed"));

      await expect(
        FacebookService.getLongLivedToken("short_lived_token")
      ).rejects.toThrow(AppError);
    });
  });

  describe("getUserPages", () => {
    it("should fetch user's Facebook pages", async () => {
      const mockPages = [
        { id: "page_1", name: "Page 1", access_token: "token_1" },
        { id: "page_2", name: "Page 2", access_token: "token_2" },
      ];

      (axios.get as jest.Mock).mockResolvedValue({
        data: {
          data: mockPages,
        },
      });

      const result = await FacebookService.getUserPages("user_token");

      expect(result).toEqual(mockPages);
      expect(result.length).toBe(2);
    });

    it("should return empty array if no pages found", async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: {},
      });

      const result = await FacebookService.getUserPages("user_token");

      expect(result).toEqual([]);
    });
  });

  describe("subscribePageToWebhook", () => {
    it("should subscribe page to webhook successfully", async () => {
      (axios.post as jest.Mock).mockResolvedValue({
        data: {
          success: true,
        },
      });

      const result = await FacebookService.subscribePageToWebhook(
        "page_id",
        "page_token"
      );

      expect(result).toBe(true);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/subscribed_apps"),
        null,
        expect.objectContaining({
          params: expect.objectContaining({
            subscribed_fields: expect.any(String),
          }),
        })
      );
    });

    it("should throw error if subscription fails", async () => {
      (axios.post as jest.Mock).mockRejectedValue(
        new Error("Subscription failed")
      );

      await expect(
        FacebookService.subscribePageToWebhook("page_id", "page_token")
      ).rejects.toThrow(AppError);
    });
  });

  describe("saveIntegration", () => {
    it("should create new integration if none exists", async () => {
      const mockIntegration = {
        id: "integration_1",
        userId: "user_1",
        platform: "facebook",
        platformPageId: "page_1",
        platformPageName: "Test Page",
      };

      (prisma.integration.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.integration.create as jest.Mock).mockResolvedValue(mockIntegration);
      (EncryptionService.encrypt as jest.Mock).mockReturnValue("encrypted_token");

      const result = await FacebookService.saveIntegration(
        "user_1",
        "page_1",
        "Test Page",
        "page_token"
      );

      expect(result).toEqual(mockIntegration);
      expect(prisma.integration.create).toHaveBeenCalled();
      expect(EncryptionService.encrypt).toHaveBeenCalledWith("page_token");
    });

    it("should update existing integration", async () => {
      const existingIntegration = {
        id: "integration_1",
        userId: "user_1",
        platform: "facebook",
        platformPageId: "page_1",
      };

      const updatedIntegration = {
        ...existingIntegration,
        platformPageName: "Updated Page",
      };

      (prisma.integration.findFirst as jest.Mock).mockResolvedValue(
        existingIntegration
      );
      (prisma.integration.update as jest.Mock).mockResolvedValue(
        updatedIntegration
      );
      (EncryptionService.encrypt as jest.Mock).mockReturnValue("encrypted_token");

      const result = await FacebookService.saveIntegration(
        "user_1",
        "page_1",
        "Updated Page",
        "page_token"
      );

      expect(result).toEqual(updatedIntegration);
      expect(prisma.integration.update).toHaveBeenCalled();
    });
  });

  describe("sendMessage", () => {
    it("should send message to Facebook user successfully", async () => {
      const mockIntegration = {
        platformPageId: "page_1",
        accessToken: "encrypted_token",
      };

      const mockResponse = {
        recipient_id: "user_123",
        message_id: "mid_123",
      };

      (prisma.integration.findFirst as jest.Mock).mockResolvedValue(
        mockIntegration
      );
      (EncryptionService.decrypt as jest.Mock).mockReturnValue("decrypted_token");
      (axios.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const result = await FacebookService.sendMessage(
        "page_1",
        "user_123",
        "Hello!"
      );

      expect(result).toEqual(mockResponse);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/me/messages"),
        expect.objectContaining({
          recipient: { id: "user_123" },
          message: { text: "Hello!" },
        }),
        expect.any(Object)
      );
    });

    it("should throw error if integration not found", async () => {
      (prisma.integration.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        FacebookService.sendMessage("page_1", "user_123", "Hello!")
      ).rejects.toThrow(AppError);
    });

    it("should throw error if message sending fails", async () => {
      const mockIntegration = {
        platformPageId: "page_1",
        accessToken: "encrypted_token",
      };

      (prisma.integration.findFirst as jest.Mock).mockResolvedValue(
        mockIntegration
      );
      (EncryptionService.decrypt as jest.Mock).mockReturnValue("decrypted_token");
      (axios.post as jest.Mock).mockRejectedValue({
        response: {
          data: {
            error: {
              message: "Message send failed",
              code: 400,
            },
          },
        },
      });

      await expect(
        FacebookService.sendMessage("page_1", "user_123", "Hello!")
      ).rejects.toThrow(AppError);
    });
  });

  describe("verifyWebhookSignature", () => {
    it("should verify valid webhook signature", () => {
      const crypto = require("crypto");
      const payload = JSON.stringify({ test: "data" });
      const signature = "sha256=" + crypto
        .createHmac("sha256", process.env.FACEBOOK_APP_SECRET || "")
        .update(payload)
        .digest("hex");

      const result = FacebookService.verifyWebhookSignature(payload, signature);

      expect(result).toBe(true);
    });

    it("should reject invalid webhook signature", () => {
      const payload = JSON.stringify({ test: "data" });
      const invalidSignature = "sha256=invalid_signature";

      const result = FacebookService.verifyWebhookSignature(
        payload,
        invalidSignature
      );

      expect(result).toBe(false);
    });
  });
});
