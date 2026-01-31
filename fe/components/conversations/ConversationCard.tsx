/**
 * Conversation Card Component
 * Individual conversation item in list
 */

import Link from "next/link";
import { ConversationResponse } from "@/types/api/conversation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { Facebook, MessageCircle } from "lucide-react";

interface ConversationCardProps {
  conversation: ConversationResponse;
}

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="h-3 w-3" />,
  shopee: <MessageCircle className="h-3 w-3" />,
  tiktok: <MessageCircle className="h-3 w-3" />,
  lazada: <MessageCircle className="h-3 w-3" />,
};

const statusLabels: Record<string, string> = {
  open: "Mở",
  pending: "Chờ",
  resolved: "Đã giải quyết",
  closed: "Đã đóng",
};

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  open: "default",
  pending: "secondary",
  resolved: "outline",
  closed: "outline",
};

export function ConversationCard({
  conversation,
}: ConversationCardProps): JSX.Element {
  return (
    <Link
      href={`/dashboard/conversations/${conversation.id}`}
      className="block rounded-lg border bg-white p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar className="h-12 w-12">
          <AvatarImage
            src={conversation.customer?.avatarUrl || undefined}
            alt={conversation.customer?.name || ""}
          />
          <AvatarFallback className="bg-blue-600 text-white">
            {getInitials(conversation.customer?.name || null)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {conversation.customer?.name || "Khách hàng"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {/* Platform badge */}
                <Badge variant="outline" className="text-xs">
                  <span className="mr-1">
                    {platformIcons[conversation.platform] || (
                      <MessageCircle className="h-3 w-3" />
                    )}
                  </span>
                  {conversation.platform.charAt(0).toUpperCase() +
                    conversation.platform.slice(1)}
                </Badge>

                {/* Message count */}
                <span className="text-xs text-gray-500">
                  {conversation.messageCount} tin nhắn
                </span>
              </div>
            </div>

            {/* Status badge */}
            <Badge variant={statusVariants[conversation.status]} className="ml-2">
              {statusLabels[conversation.status]}
            </Badge>
          </div>

          {/* Meta info */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {conversation.assignedAgent && (
                <span>
                  Người xử lý: {conversation.assignedAgent.name}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {formatRelativeTime(conversation.lastMessageAt)}
            </span>
          </div>

          {/* AI analysis tags */}
          {(conversation.intent || conversation.sentiment) && (
            <div className="flex items-center gap-2 mt-2">
              {conversation.intent && (
                <Badge variant="outline" className="text-xs">
                  {conversation.intent === "product_inquiry"
                    ? "Hỏi sản phẩm"
                    : conversation.intent === "support_request"
                    ? "Hỗ trợ"
                    : conversation.intent === "complaint"
                    ? "Khiếu nại"
                    : "Khác"}
                </Badge>
              )}
              {conversation.sentiment && (
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    conversation.sentiment === "positive"
                      ? "border-green-500 text-green-700"
                      : conversation.sentiment === "negative"
                      ? "border-red-500 text-red-700"
                      : "border-gray-300"
                  }`}
                >
                  {conversation.sentiment === "positive"
                    ? "😊 Tích cực"
                    : conversation.sentiment === "negative"
                    ? "😞 Tiêu cực"
                    : "😐 Trung tính"}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
