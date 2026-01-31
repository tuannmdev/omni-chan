/**
 * Swagger/OpenAPI Configuration
 * API Documentation Setup
 */

import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Omni-chan API Documentation",
      version: "1.0.0",
      description: "AI-powered Omnichannel Customer Support Platform API",
      contact: {
        name: "Omni-chan Support",
        email: "support@omnichan.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
      {
        url: "https://api.omnichan.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT access token from /api/auth/login or /api/auth/register",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "string",
              example: "Error message here",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "clxyz123456",
            },
            email: {
              type: "string",
              example: "user@example.com",
            },
            name: {
              type: "string",
              example: "John Doe",
            },
            role: {
              type: "string",
              enum: ["owner", "admin", "agent"],
              example: "owner",
            },
            planType: {
              type: "string",
              enum: ["free", "basic", "premium", "enterprise"],
              example: "free",
            },
            subscriptionStatus: {
              type: "string",
              enum: ["active", "inactive", "trial"],
              example: "active",
            },
            isActive: {
              type: "boolean",
              example: true,
            },
            emailVerified: {
              type: "boolean",
              example: false,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Customer: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "clxyz789012",
            },
            name: {
              type: "string",
              example: "Nguyễn Văn A",
            },
            email: {
              type: "string",
              example: "customer@example.com",
            },
            phone: {
              type: "string",
              example: "0912345678",
            },
            facebookId: {
              type: "string",
              example: "123456789",
            },
            shopeeId: {
              type: "string",
              example: "shopee_user_123",
            },
            customerSegment: {
              type: "string",
              example: "VIP",
            },
            totalSpent: {
              type: "number",
              example: 1500000,
            },
            totalOrders: {
              type: "integer",
              example: 5,
            },
            averageOrderValue: {
              type: "number",
              example: 300000,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Conversation: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "clxyz345678",
            },
            platform: {
              type: "string",
              enum: ["facebook", "shopee", "tiktok", "lazada"],
              example: "facebook",
            },
            status: {
              type: "string",
              enum: ["open", "assigned", "resolved", "closed"],
              example: "open",
            },
            platformConversationId: {
              type: "string",
              example: "fb_conv_123",
            },
            lastMessage: {
              type: "string",
              example: "Xin chào, tôi muốn hỏi về sản phẩm",
            },
            lastMessageAt: {
              type: "string",
              format: "date-time",
            },
            aiIntent: {
              type: "string",
              example: "product_inquiry",
            },
            aiSentiment: {
              type: "string",
              example: "positive",
            },
            aiPurchaseProbability: {
              type: "number",
              example: 0.85,
            },
            aiUrgencyLevel: {
              type: "string",
              example: "normal",
            },
            customerId: {
              type: "string",
              example: "clxyz789012",
            },
            assignedToId: {
              type: "string",
              example: "clxyz123456",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              example: 1,
            },
            limit: {
              type: "integer",
              example: 20,
            },
            total: {
              type: "integer",
              example: 50,
            },
            totalPages: {
              type: "integer",
              example: 3,
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization endpoints",
      },
      {
        name: "Users",
        description: "User management endpoints",
      },
      {
        name: "Customers",
        description: "Customer profile management endpoints",
      },
      {
        name: "Conversations",
        description: "Conversation and message management endpoints",
      },
      {
        name: "Health",
        description: "System health check endpoints",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
