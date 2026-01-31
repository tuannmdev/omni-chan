/**
 * Validation Utility
 * Common validation functions
 */

export class ValidationService {
  /**
   * Validate email format
   */
  public static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * At least 8 characters
   */
  public static isValidPassword(password: string): boolean {
    return password.length >= 8;
  }

  /**
   * Validate phone number (Vietnamese format)
   */
  public static isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+84|84|0)?[0-9]{9,10}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Sanitize string input
   */
  public static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, "");
  }

  /**
   * Validate pagination parameters
   */
  public static validatePagination(page?: number, limit?: number): { page: number; limit: number } {
    const validPage = page && page > 0 ? page : 1;
    const validLimit = limit && limit > 0 && limit <= 100 ? limit : 20;
    return { page: validPage, limit: validLimit };
  }

  /**
   * Check if string is a valid CUID
   */
  public static isValidCuid(id: string): boolean {
    return /^c[a-z0-9]{24}$/.test(id);
  }
}
