"use client";

/**
 * Conversation List Component
 * List of conversations with loading and empty states
 */

import { ConversationResponse } from "@/types/api/conversation";
import { ConversationCard } from "./ConversationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";

interface ConversationListProps {
  conversations: ConversationResponse[];
  isLoading: boolean;
}

export function ConversationList({
  conversations,
  isLoading,
}: ConversationListProps): JSX.Element {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-lg border bg-white p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-white p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-gray-100 p-3">
            <MessageSquare className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chưa có hội thoại nào
        </h3>
        <p className="text-sm text-gray-500">
          Hội thoại sẽ xuất hiện ở đây khi có khách hàng liên hệ
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <ConversationCard key={conversation.id} conversation={conversation} />
      ))}
    </div>
  );
}
