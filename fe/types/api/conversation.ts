/**
 * Conversation Type Definitions
 */

export interface CreateConversationDto {
  customerId: string;
  integrationId: string;
  platform: string;
  platformThreadId: string;
  status?: string;
  priority?: string;
}

export interface UpdateConversationDto {
  status?: string;
  priority?: string;
  assignedAgentId?: string;
  intent?: string;
  sentiment?: string;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  content: string;
  contentType: string;
  senderType: string;
  senderId: string | null;
  senderName: string | null;
  senderAvatarUrl: string | null;
  isRead: boolean;
  sentAt: Date;
  deliveredAt: Date | null;
  readAt: Date | null;
  attachments?: {
    id: string;
    url: string;
    type: string;
  }[];
}

export interface ConversationResponse {
  id: string;
  customerId: string;
  integrationId: string;
  platform: string;
  platformThreadId: string;
  status: string;
  priority: string;
  assignedAgentId: string | null;
  messageCount: number;
  intent: string | null;
  sentiment: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
  customer?: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
    customerSegment: string | null;
    totalOrders: number;
    totalOrderValue: number;
    customerLifetimeValue: number;
  };
  assignedAgent?: {
    id: string;
    name: string | null;
    email?: string;
  };
  messages?: MessageResponse[];
}
