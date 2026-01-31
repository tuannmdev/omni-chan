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
    avatarUrl: string | null;
  };
  assignedAgent?: {
    id: string;
    name: string | null;
  };
}
