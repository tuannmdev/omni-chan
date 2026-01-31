/**
 * Database Utility
 * Prisma Client singleton to ensure single database connection instance
 */

import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

class DatabaseClient {
  private static instance: PrismaClient | null = null;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new PrismaClient({
        log: [
          { level: "query", emit: "event" },
          { level: "error", emit: "stdout" },
          { level: "warn", emit: "stdout" },
        ],
      });

      // Log queries in development
      if (process.env.NODE_ENV === "development") {
        DatabaseClient.instance.$on("query" as never, (e: any) => {
          logger.debug(`Query: ${e.query}`);
          logger.debug(`Duration: ${e.duration}ms`);
        });
      }

      logger.info("Database connection established");
    }

    return DatabaseClient.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseClient.instance) {
      await DatabaseClient.instance.$disconnect();
      DatabaseClient.instance = null;
      logger.info("Database connection closed");
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const client = DatabaseClient.getInstance();
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error("Database health check failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const prisma = DatabaseClient.getInstance();
export const disconnectDatabase = DatabaseClient.disconnect;
export const databaseHealthCheck = DatabaseClient.healthCheck;
