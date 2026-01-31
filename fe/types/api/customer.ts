/**
 * Customer Type Definitions
 */

export interface CreateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  facebookId?: string;
  shopeeId?: string;
  tiktokId?: string;
  lazadaId?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  customerSegment?: string;
  interests?: string[];
  preferredProducts?: string[];
  communicationStyle?: string;
}

export interface CustomerResponse {
  id: string;
  userId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  facebookId: string | null;
  shopeeId: string | null;
  tiktokId: string | null;
  lazadaId: string | null;
  totalConversations: number;
  totalOrders: number;
  totalOrderValue: number;
  customerLifetimeValue: number;
  customerSegment: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
