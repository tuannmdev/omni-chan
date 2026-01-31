/**
 * Integration Tests for Webhooks Endpoints
 */

import request from "supertest";
import app from "../../app";
import { HTTP_STATUS } from "../../utils/constants";

// Mock database and services
jest.mock("../../utils/database", () => ({
  prisma: {
    integration: {
      findFirst: jest.fn(),
    },
    customer: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    conversation: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    message: {
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    messageAttachment: {
      create: jest.fn(),
    },
  },
  databaseHealthCheck: jest.fn().mockResolvedValue(true),
}));

const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || "omnichan-webhook-verify-token";

describe("Webhooks Integration Tests", () => {
  describe("GET /api/webhooks/facebook - Verification", () => {
    it("should verify webhook with correct token", async () => {
      const challenge = "test_challenge_string";

      const response = await request(app)
        .get("/api/webhooks/facebook")
        .query({
          "hub.mode": "subscribe",
          "hub.verify_token": VERIFY_TOKEN,
          "hub.challenge": challenge,
        });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.text).toBe(challenge);
    });

    it("should reject verification with incorrect token", async () => {
      const response = await request(app)
        .get("/api/webhooks/facebook")
        .query({
          "hub.mode": "subscribe",
          "hub.verify_token": "wrong_token",
          "hub.challenge": "test_challenge",
        });

      expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
      expect(response.body.success).toBe(false);
    });

    it("should reject verification with missing parameters", async () => {
      const response = await request(app)
        .get("/api/webhooks/facebook")
        .query({
          "hub.mode": "subscribe",
        });

      expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
    });
  });

  describe("POST /api/webhooks/facebook - Receive Events", () => {
    it("should accept valid webhook payload", async () => {
      const webhookPayload = {
        object: "page",
        entry: [
          {
            id: "page_id_123",
            time: Date.now(),
            messaging: [
              {
                sender: {
                  id: "user_123",
                },
                recipient: {
                  id: "page_123",
                },
                timestamp: Date.now(),
                message: {
                  mid: "mid_123",
                  text: "Hello!",
                },
              },
            ],
          },
        ],
      };

      const response = await request(app)
        .post("/api/webhooks/facebook")
        .send(webhookPayload);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
    });

    it("should accept webhook with multiple messaging events", async () => {
      const webhookPayload = {
        object: "page",
        entry: [
          {
            id: "page_id_123",
            time: Date.now(),
            messaging: [
              {
                sender: { id: "user_1" },
                recipient: { id: "page_123" },
                timestamp: Date.now(),
                message: {
                  mid: "mid_1",
                  text: "First message",
                },
              },
              {
                sender: { id: "user_2" },
                recipient: { id: "page_123" },
                timestamp: Date.now(),
                message: {
                  mid: "mid_2",
                  text: "Second message",
                },
              },
            ],
          },
        ],
      };

      const response = await request(app)
        .post("/api/webhooks/facebook")
        .send(webhookPayload);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
    });

    it("should handle webhook with message attachments", async () => {
      const webhookPayload = {
        object: "page",
        entry: [
          {
            id: "page_id_123",
            time: Date.now(),
            messaging: [
              {
                sender: { id: "user_123" },
                recipient: { id: "page_123" },
                timestamp: Date.now(),
                message: {
                  mid: "mid_123",
                  attachments: [
                    {
                      type: "image",
                      payload: {
                        url: "https://example.com/image.jpg",
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const response = await request(app)
        .post("/api/webhooks/facebook")
        .send(webhookPayload);

      expect(response.status).toBe(HTTP_STATUS.OK);
    });

    it("should handle webhook with read receipts", async () => {
      const webhookPayload = {
        object: "page",
        entry: [
          {
            id: "page_id_123",
            time: Date.now(),
            messaging: [
              {
                sender: { id: "user_123" },
                recipient: { id: "page_123" },
                timestamp: Date.now(),
                read: {
                  watermark: Date.now(),
                },
              },
            ],
          },
        ],
      };

      const response = await request(app)
        .post("/api/webhooks/facebook")
        .send(webhookPayload);

      expect(response.status).toBe(HTTP_STATUS.OK);
    });

    it("should handle webhook with delivery confirmations", async () => {
      const webhookPayload = {
        object: "page",
        entry: [
          {
            id: "page_id_123",
            time: Date.now(),
            messaging: [
              {
                sender: { id: "user_123" },
                recipient: { id: "page_123" },
                timestamp: Date.now(),
                delivery: {
                  watermark: Date.now(),
                  mids: ["mid_1", "mid_2"],
                },
              },
            ],
          },
        ],
      };

      const response = await request(app)
        .post("/api/webhooks/facebook")
        .send(webhookPayload);

      expect(response.status).toBe(HTTP_STATUS.OK);
    });

    it("should respond 200 even with invalid payload to prevent retries", async () => {
      const invalidPayload = {
        invalid: "data",
      };

      const response = await request(app)
        .post("/api/webhooks/facebook")
        .send(invalidPayload);

      // Should still return 200 to acknowledge receipt
      expect(response.status).toBe(HTTP_STATUS.OK);
    });
  });
});
