/**
 * Message Bubble Component
 * Individual message display with sender info and timestamps
 */

import { MessageResponse } from "@/types/api/conversation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDateTime, getInitials } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: MessageResponse;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps): JSX.Element {
  const hasAttachments = message.attachments && message.attachments.length > 0;

  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      {!isOwn && (
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={message.senderAvatarUrl || undefined}
            alt={message.senderName || ""}
          />
          <AvatarFallback className="bg-blue-600 text-white text-xs">
            {getInitials(message.senderName || null)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div className={`flex flex-col max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender Name (for customer messages) */}
        {!isOwn && message.senderName && (
          <span className="text-xs text-gray-500 mb-1 px-1">
            {message.senderName}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwn
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {/* Attachments */}
          {hasAttachments && (
            <div className="mt-2 space-y-2">
              {message.attachments!.map((attachment) => (
                <div key={attachment.id}>
                  {attachment.type.startsWith("image/") ? (
                    <img
                      src={attachment.url}
                      alt="Attachment"
                      className="rounded max-w-full h-auto"
                    />
                  ) : (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm underline ${
                        isOwn ? "text-blue-100" : "text-blue-600"
                      }`}
                    >
                      Xem tệp đính kèm
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp and Status */}
        <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs text-gray-400">
            {formatDateTime(message.sentAt)}
          </span>

          {/* Read/Delivered indicators (for agent messages only) */}
          {isOwn && (
            <div>
              {message.readAt ? (
                <CheckCheck className="h-3 w-3 text-blue-600" />
              ) : message.deliveredAt ? (
                <CheckCheck className="h-3 w-3 text-gray-400" />
              ) : (
                <Check className="h-3 w-3 text-gray-400" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
