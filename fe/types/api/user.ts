/**
 * User Type Definitions
 */

export interface UpdateUserDto {
  name?: string;
  avatarUrl?: string;
  timezone?: string;
  language?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  planType: string;
  subscriptionStatus: string;
  timezone: string;
  language: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
