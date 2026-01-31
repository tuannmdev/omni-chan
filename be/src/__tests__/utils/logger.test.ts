/**
 * Unit Tests for Logger Utility
 */

import { Logger } from "../../utils/logger";

describe("Logger", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console methods
    consoleSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    // Restore console
    consoleSpy.mockRestore();
  });

  describe("debug", () => {
    it("should log debug messages in development environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const logger = new Logger();
      logger.debug("Debug message");

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0][0];
      expect(logOutput).toContain("[DEBUG]");
      expect(logOutput).toContain("Debug message");

      process.env.NODE_ENV = originalEnv;
    });

    it("should not log debug messages in production environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const logger = new Logger();
      logger.debug("Debug message");

      expect(consoleSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("info", () => {
    it("should log info messages", () => {
      const logger = new Logger();
      logger.info("Info message");

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0][0];
      expect(logOutput).toContain("[INFO]");
      expect(logOutput).toContain("Info message");
    });

    it("should handle multiple arguments", () => {
      const logger = new Logger();
      logger.info("User created:", { id: "123", email: "test@example.com" });

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0];
      expect(logOutput[0]).toContain("[INFO]");
      expect(logOutput[0]).toContain("User created:");
      expect(logOutput[1]).toEqual({ id: "123", email: "test@example.com" });
    });
  });

  describe("warn", () => {
    it("should log warning messages", () => {
      const logger = new Logger();
      logger.warn("Warning message");

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0][0];
      expect(logOutput).toContain("[WARN]");
      expect(logOutput).toContain("Warning message");
    });
  });

  describe("error", () => {
    it("should log error messages", () => {
      const logger = new Logger();
      logger.error("Error message");

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0][0];
      expect(logOutput).toContain("[ERROR]");
      expect(logOutput).toContain("Error message");
    });

    it("should log Error objects", () => {
      const logger = new Logger();
      const error = new Error("Test error");
      logger.error("An error occurred:", error);

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0];
      expect(logOutput[0]).toContain("[ERROR]");
      expect(logOutput[0]).toContain("An error occurred:");
      expect(logOutput[1]).toBeInstanceOf(Error);
    });
  });

  describe("timestamp formatting", () => {
    it("should include timestamp in log messages", () => {
      const logger = new Logger();
      logger.info("Test message");

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0][0];

      // Check for timestamp format: YYYY-MM-DD HH:mm:ss
      const timestampPattern = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/;
      expect(timestampPattern.test(logOutput)).toBe(true);
    });
  });
});
