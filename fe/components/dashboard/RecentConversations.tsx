"use client";

/**
 * Recent Conversations Component
 * Display recent conversations on dashboard
 */

import { useEffect } from "react";
import Link from "next/link";
import { useConversations } from "@/hooks/useConversations";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentConversations(): JSX.Element {
  const { conversations, fetchConversations, isLoading } = useConversations();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hội thoại gần đây</CardTitle>
        <Link
          href="/dashboard/conversations"
          className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1"
        >
          Xem tất cả
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8">
            Chưa có hội thoại nào
          </p>
        ) : (
          <div className="space-y-4">
            {conversations.slice(0, 5).map((conversation) => (
              <Link
                key={conversation.id}
                href={`/dashboard/conversations/${conversation.id}`}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <Avatar>
                  <AvatarImage
                    src={conversation.customer?.avatarUrl || undefined}
                    alt={conversation.customer?.name || ""}
                  />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {getInitials(conversation.customer?.name || null)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.customer?.name || "Khách hàng"}
                    </p>
                    <Badge
                      variant={
                        conversation.status === "open"
                          ? "default"
                          : conversation.status === "pending"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {conversation.status === "open"
                        ? "Mở"
                        : conversation.status === "pending"
                        ? "Chờ"
                        : conversation.status === "resolved"
                        ? "Đã giải quyết"
                        : "Đã đóng"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {conversation.platform.charAt(0).toUpperCase() +
                        conversation.platform.slice(1)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatRelativeTime(conversation.lastMessageAt)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
