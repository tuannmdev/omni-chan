/**
 * Integration Card Component
 * Display integration status and controls
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import { Facebook, MessageCircle, Unplug, CheckCircle, AlertCircle } from "lucide-react";

interface IntegrationCardProps {
  integration: {
    id: string;
    platform: string;
    platformAccountId: string | null;
    platformAccountName: string | null;
    pageId: string | null;
    pageName: string | null;
    isActive: boolean;
    lastSyncAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  onDisconnect: (id: string) => void;
  isDisconnecting?: boolean;
}

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="h-5 w-5" />,
  shopee: <MessageCircle className="h-5 w-5" />,
  tiktok: <MessageCircle className="h-5 w-5" />,
  lazada: <MessageCircle className="h-5 w-5" />,
};

const platformLabels: Record<string, string> = {
  facebook: "Facebook",
  shopee: "Shopee",
  tiktok: "TikTok Shop",
  lazada: "Lazada",
};

const platformColors: Record<string, string> = {
  facebook: "bg-blue-600",
  shopee: "bg-orange-600",
  tiktok: "bg-black",
  lazada: "bg-purple-600",
};

export function IntegrationCard({
  integration,
  onDisconnect,
  isDisconnecting = false,
}: IntegrationCardProps): JSX.Element {
  const platformLabel = platformLabels[integration.platform] || integration.platform;
  const platformIcon = platformIcons[integration.platform] || <MessageCircle className="h-5 w-5" />;
  const platformColor = platformColors[integration.platform] || "bg-gray-600";

  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${platformColor} text-white p-3 rounded-lg`}>
            {platformIcon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {platformLabel}
            </h3>
            <p className="text-sm text-gray-500">
              {integration.pageName || integration.platformAccountName || "Chưa có tên"}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <Badge variant={integration.isActive ? "default" : "secondary"}>
          {integration.isActive ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Đang hoạt động
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3 mr-1" />
              Không hoạt động
            </>
          )}
        </Badge>
      </div>

      {/* Integration Details */}
      <div className="space-y-2 mb-4">
        {integration.pageId && (
          <div className="text-sm">
            <span className="text-gray-500">Page ID: </span>
            <span className="text-gray-900 font-mono">{integration.pageId}</span>
          </div>
        )}

        {integration.platformAccountId && (
          <div className="text-sm">
            <span className="text-gray-500">Account ID: </span>
            <span className="text-gray-900 font-mono">{integration.platformAccountId}</span>
          </div>
        )}

        {integration.lastSyncAt && (
          <div className="text-sm">
            <span className="text-gray-500">Đồng bộ lần cuối: </span>
            <span className="text-gray-900">
              {formatRelativeTime(integration.lastSyncAt)}
            </span>
          </div>
        )}

        <div className="text-sm">
          <span className="text-gray-500">Kết nối lúc: </span>
          <span className="text-gray-900">
            {formatRelativeTime(integration.createdAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDisconnect(integration.id)}
          disabled={isDisconnecting}
        >
          <Unplug className="h-4 w-4 mr-1" />
          {isDisconnecting ? "Đang ngắt kết nối..." : "Ngắt kết nối"}
        </Button>
      </div>
    </div>
  );
}
