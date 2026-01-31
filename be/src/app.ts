/**
 * Main Application Entry Point
 * Express.js + TypeScript Backend for Omni-chan
 */

import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { corsMiddleware } from "./middleware/cors.middleware";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { rateLimiter } from "./middleware/ratelimit.middleware";
import { logger } from "./utils/logger";
import { prisma, databaseHealthCheck } from "./utils/database";
import { swaggerSpec } from "./config/swagger";

// Import routes
import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import customersRoutes from "./routes/customers.routes";
import conversationsRoutes from "./routes/conversations.routes";
import integrationsRoutes from "./routes/integrations.routes";
import webhooksRoutes from "./routes/webhooks.routes";
import aiRoutes from "./routes/ai.routes";

// Load environment variables
dotenv.config();

// Create Express app
const app: Express = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(helmet()); // Security headers
app.use(corsMiddleware); // CORS configuration
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(rateLimiter.middleware()); // Rate limiting

// Health check endpoint
app.get("/health", async (req: Request, res: Response) => {
  const dbHealthy = await databaseHealthCheck();

  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    database: dbHealthy ? "connected" : "disconnected",
  });
});

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Omni-chan API Documentation",
}));

// API Routes
app.get("/", (req: Request, res: Response) => {
  res.json({
    name: "Omni-chan API",
    version: "1.0.0",
    description: "AI-powered Omnichannel Customer Support Platform",
    endpoints: {
      health: "/health",
      documentation: "/api-docs",
      auth: "/api/auth",
      users: "/api/users",
      customers: "/api/customers",
      conversations: "/api/conversations",
      integrations: "/api/integrations",
      webhooks: "/api/webhooks",
      ai: "/api/ai",
    },
  });
});

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/conversations", conversationsRoutes);
app.use("/api/integrations", integrationsRoutes);
app.use("/api/webhooks", webhooksRoutes);
app.use("/api", aiRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
  logger.info("Shutting down gracefully...");

  try {
    await prisma.$disconnect();
    logger.info("Database connection closed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`📝 Environment: ${NODE_ENV}`);
  logger.info(`🔗 API URL: http://localhost:${PORT}`);
  logger.info(`💚 Health check: http://localhost:${PORT}/health`);
});

export default app;
