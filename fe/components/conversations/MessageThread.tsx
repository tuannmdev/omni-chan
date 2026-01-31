"use client";

/**
 * Message Thread Component
 * Container for displaying conversation messages
 */

import { useEffect, useRef } from "react";
import { MessageResponse } from "@/types/api/conversation";
import { MessageBubble } from "./MessageBubble";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";

interface MessageThreadProps {
  messages: MessageResponse[];
  currentUserId: string | null;
  isLoading: boolean;
}

export function MessageThread({
  messages,
  currentUserId,
  isLoading,
}: MessageThreadProps): JSX.Element {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : "flex-row"}`}>
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-16 w-64" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-gray-100 p-3">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có tin nhắn nào
          </h3>
          <p className="text-sm text-gray-500">
            Hãy gửi tin nhắn đầu tiên để bắt đầu hội thoại
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwn = message.senderType === "agent" && message.senderId === currentUserId;
        return (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={isOwn}
          />
        );
      })}
      {/* Invisible element for auto-scroll */}
      <div ref={messagesEndRef} />
    </div>
  );
}
