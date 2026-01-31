/**
 * Unit Tests for Validation Utility
 */

import { ValidationService } from "../../utils/validation";

describe("ValidationService", () => {
  describe("validateEmail", () => {
    it("should return true for valid email addresses", () => {
      const validEmails = [
        "user@example.com",
        "test.user@domain.co.uk",
        "admin+test@omnichan.com",
        "user123@test-domain.com",
      ];

      validEmails.forEach((email) => {
        expect(ValidationService.validateEmail(email)).toBe(true);
      });
    });

    it("should return false for invalid email addresses", () => {
      const invalidEmails = [
        "invalid",
        "@example.com",
        "user@",
        "user @example.com",
        "user@example",
        "",
        "user@.com",
      ];

      invalidEmails.forEach((email) => {
        expect(ValidationService.validateEmail(email)).toBe(false);
      });
    });
  });

  describe("validatePassword", () => {
    it("should return true for passwords with 8+ characters", () => {
      const validPasswords = [
        "password123",
        "12345678",
        "abcdefgh",
        "P@ssw0rd!",
        "verylongpassword",
      ];

      validPasswords.forEach((password) => {
        expect(ValidationService.validatePassword(password)).toBe(true);
      });
    });

    it("should return false for passwords with less than 8 characters", () => {
      const invalidPasswords = [
        "pass",
        "1234567",
        "abc",
        "",
        "short",
      ];

      invalidPasswords.forEach((password) => {
        expect(ValidationService.validatePassword(password)).toBe(false);
      });
    });
  });

  describe("validatePhoneNumber", () => {
    it("should return true for valid Vietnamese phone numbers", () => {
      const validPhones = [
        "0912345678",
        "0987654321",
        "0123456789",
        "+84912345678",
        "+84987654321",
        "84912345678",
      ];

      validPhones.forEach((phone) => {
        expect(ValidationService.validatePhoneNumber(phone)).toBe(true);
      });
    });

    it("should return false for invalid phone numbers", () => {
      const invalidPhones = [
        "123",
        "abcdefghij",
        "091234567", // 9 digits
        "09123456789", // 11 digits
        "+1234567890",
        "",
        "091-234-5678",
      ];

      invalidPhones.forEach((phone) => {
        expect(ValidationService.validatePhoneNumber(phone)).toBe(false);
      });
    });
  });

  describe("validatePagination", () => {
    it("should return validated page and limit for valid inputs", () => {
      const result = ValidationService.validatePagination(2, 50);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });

    it("should default to page 1 for invalid page numbers", () => {
      expect(ValidationService.validatePagination(0, 20).page).toBe(1);
      expect(ValidationService.validatePagination(-5, 20).page).toBe(1);
      expect(ValidationService.validatePagination(NaN, 20).page).toBe(1);
    });

    it("should default to limit 20 for invalid limit values", () => {
      expect(ValidationService.validatePagination(1, 0).limit).toBe(20);
      expect(ValidationService.validatePagination(1, -10).limit).toBe(20);
      expect(ValidationService.validatePagination(1, NaN).limit).toBe(20);
    });

    it("should cap limit at 100", () => {
      expect(ValidationService.validatePagination(1, 150).limit).toBe(100);
      expect(ValidationService.validatePagination(1, 200).limit).toBe(100);
    });

    it("should handle edge cases", () => {
      const result1 = ValidationService.validatePagination(1, 1);
      expect(result1.page).toBe(1);
      expect(result1.limit).toBe(1);

      const result2 = ValidationService.validatePagination(100, 100);
      expect(result2.page).toBe(100);
      expect(result2.limit).toBe(100);
    });
  });
});
