"use client";

/**
 * Dashboard Overview Page
 * Main dashboard with stats and recent conversations
 */

import { useEffect, useMemo } from "react";
import { useConversations } from "@/hooks/useConversations";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentConversations } from "@/components/dashboard/RecentConversations";
import { MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function DashboardPage(): JSX.Element {
  const { conversations, fetchConversations } = useConversations();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = conversations.length;
    const open = conversations.filter((c) => c.status === "open").length;
    const pending = conversations.filter((c) => c.status === "pending").length;
    const resolved = conversations.filter((c) => c.status === "resolved").length;

    return { total, open, pending, resolved };
  }, [conversations]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
        <p className="mt-2 text-gray-600">
          Chào mừng bạn đến với Omni-chan
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng hội thoại"
          value={stats.total}
          icon={MessageSquare}
          description="Tất cả hội thoại"
        />
        <StatsCard
          title="Đang mở"
          value={stats.open}
          icon={AlertCircle}
          description="Cần phản hồi"
        />
        <StatsCard
          title="Chờ xử lý"
          value={stats.pending}
          icon={Clock}
          description="Đang chờ"
        />
        <StatsCard
          title="Đã giải quyết"
          value={stats.resolved}
          icon={CheckCircle}
          description="Hôm nay"
        />
      </div>

      {/* Recent conversations */}
      <RecentConversations />
    </div>
  );
}
