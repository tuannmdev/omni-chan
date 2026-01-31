"use client";

/**
 * Conversations List Page
 * Main page for viewing and filtering conversations
 */

import { useEffect } from "react";
import { useConversations } from "@/hooks/useConversations";
import { ConversationList } from "@/components/conversations/ConversationList";
import { ConversationFilters } from "@/components/conversations/ConversationFilters";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ConversationsPage(): JSX.Element {
  const {
    conversations,
    filters,
    pagination,
    isLoading,
    fetchConversations,
    updateFilters,
  } = useConversations();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleStatusChange = (status: string): void => {
    updateFilters({
      status: status === "all" ? undefined : status,
      page: 1,
    });
  };

  const handlePlatformChange = (platform: string): void => {
    updateFilters({
      platform: platform === "all" ? undefined : platform,
      page: 1,
    });
  };

  const handlePreviousPage = (): void => {
    if (pagination && filters.page > 1) {
      updateFilters({ page: filters.page - 1 });
    }
  };

  const handleNextPage = (): void => {
    if (pagination && filters.page < pagination.totalPages) {
      updateFilters({ page: filters.page + 1 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hội thoại</h1>
        <p className="mt-2 text-gray-600">
          Quản lý và theo dõi tất cả hội thoại với khách hàng
        </p>
      </div>

      {/* Filters */}
      <ConversationFilters
        status={filters.status}
        platform={filters.platform}
        onStatusChange={handleStatusChange}
        onPlatformChange={handlePlatformChange}
      />

      {/* Conversation List */}
      <ConversationList conversations={conversations} isLoading={isLoading} />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t bg-white px-4 py-3 sm:px-6 rounded-lg">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={filters.page === 1}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={filters.page === pagination.totalPages}
            >
              Sau
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị{" "}
                <span className="font-medium">
                  {(filters.page - 1) * filters.limit + 1}
                </span>{" "}
                đến{" "}
                <span className="font-medium">
                  {Math.min(filters.page * filters.limit, pagination.total)}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-medium">{pagination.total}</span> kết quả
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={filters.page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={filters.page === pagination.totalPages}
              >
                Sau
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
