/**
 * Unit Tests for Encryption Utility
 */

import { EncryptionService } from "../../utils/encryption";

describe("EncryptionService", () => {
  describe("hashPassword", () => {
    it("should hash a password successfully", async () => {
      const password = "password123";
      const hash = await EncryptionService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should generate different hashes for the same password", async () => {
      const password = "password123";
      const hash1 = await EncryptionService.hashPassword(password);
      const hash2 = await EncryptionService.hashPassword(password);

      expect(hash1).not.toBe(hash2); // Bcrypt uses random salts
    });

    it("should handle empty passwords", async () => {
      const hash = await EncryptionService.hashPassword("");
      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe("comparePassword", () => {
    it("should return true for matching password and hash", async () => {
      const password = "password123";
      const hash = await EncryptionService.hashPassword(password);
      const isMatch = await EncryptionService.comparePassword(password, hash);

      expect(isMatch).toBe(true);
    });

    it("should return false for non-matching password and hash", async () => {
      const password = "password123";
      const wrongPassword = "wrongpassword";
      const hash = await EncryptionService.hashPassword(password);
      const isMatch = await EncryptionService.comparePassword(wrongPassword, hash);

      expect(isMatch).toBe(false);
    });

    it("should return false for empty password against valid hash", async () => {
      const password = "password123";
      const hash = await EncryptionService.hashPassword(password);
      const isMatch = await EncryptionService.comparePassword("", hash);

      expect(isMatch).toBe(false);
    });
  });

  describe("encrypt and decrypt", () => {
    it("should encrypt and decrypt text successfully", () => {
      const plainText = "sensitive data 123";
      const encrypted = EncryptionService.encrypt(plainText);
      const decrypted = EncryptionService.decrypt(encrypted);

      expect(encrypted).not.toBe(plainText);
      expect(decrypted).toBe(plainText);
    });

    it("should handle empty strings", () => {
      const plainText = "";
      const encrypted = EncryptionService.encrypt(plainText);
      const decrypted = EncryptionService.decrypt(encrypted);

      expect(decrypted).toBe(plainText);
    });

    it("should handle special characters", () => {
      const plainText = "Special: !@#$%^&*()_+-=[]{}|;:',.<>?/~`";
      const encrypted = EncryptionService.encrypt(plainText);
      const decrypted = EncryptionService.decrypt(encrypted);

      expect(decrypted).toBe(plainText);
    });

    it("should handle Unicode characters", () => {
      const plainText = "Tiếng Việt có dấu 中文 日本語";
      const encrypted = EncryptionService.encrypt(plainText);
      const decrypted = EncryptionService.decrypt(encrypted);

      expect(decrypted).toBe(plainText);
    });

    it("should produce different encrypted values for same input", () => {
      const plainText = "test data";
      const encrypted1 = EncryptionService.encrypt(plainText);
      const encrypted2 = EncryptionService.encrypt(plainText);

      // Due to random IV, encrypted values should be different
      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to the same value
      expect(EncryptionService.decrypt(encrypted1)).toBe(plainText);
      expect(EncryptionService.decrypt(encrypted2)).toBe(plainText);
    });

    it("should handle long strings", () => {
      const plainText = "A".repeat(1000);
      const encrypted = EncryptionService.encrypt(plainText);
      const decrypted = EncryptionService.decrypt(encrypted);

      expect(decrypted).toBe(plainText);
    });
  });

  describe("generateToken", () => {
    it("should generate a token with default length of 32", () => {
      const token = EncryptionService.generateToken();
      expect(token).toBeDefined();
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters
    });

    it("should generate a token with custom length", () => {
      const token = EncryptionService.generateToken(16);
      expect(token).toBeDefined();
      expect(token.length).toBe(32); // 16 bytes = 32 hex characters
    });

    it("should generate different tokens each time", () => {
      const token1 = EncryptionService.generateToken();
      const token2 = EncryptionService.generateToken();

      expect(token1).not.toBe(token2);
    });

    it("should generate tokens with only hex characters", () => {
      const token = EncryptionService.generateToken();
      const hexPattern = /^[0-9a-f]+$/;

      expect(hexPattern.test(token)).toBe(true);
    });
  });
});
