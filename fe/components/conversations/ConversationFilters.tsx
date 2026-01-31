"use client";

/**
 * Conversation Filters Component
 * Filters for status, platform, etc.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ConversationFiltersProps {
  status?: string;
  platform?: string;
  onStatusChange: (status: string) => void;
  onPlatformChange: (platform: string) => void;
}

export function ConversationFilters({
  status,
  platform,
  onStatusChange,
  onPlatformChange,
}: ConversationFiltersProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Status filter */}
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="status-filter" className="text-sm font-medium mb-2">
          Trạng thái
        </Label>
        <Select value={status || "all"} onValueChange={onStatusChange}>
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="open">Đang mở</SelectItem>
            <SelectItem value="pending">Chờ xử lý</SelectItem>
            <SelectItem value="resolved">Đã giải quyết</SelectItem>
            <SelectItem value="closed">Đã đóng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Platform filter */}
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="platform-filter" className="text-sm font-medium mb-2">
          Nền tảng
        </Label>
        <Select value={platform || "all"} onValueChange={onPlatformChange}>
          <SelectTrigger id="platform-filter">
            <SelectValue placeholder="Tất cả nền tảng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="shopee">Shopee</SelectItem>
            <SelectItem value="tiktok">TikTok Shop</SelectItem>
            <SelectItem value="lazada">Lazada</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
