"use client";

/**
 * Integrations Page
 * Manage platform integrations (Facebook, Shopee, TikTok, Lazada)
 */

import { useEffect, useState } from "react";
import { integrationsApi } from "@/lib/api/endpoints/integrations";
import { IntegrationCard } from "@/components/integrations/IntegrationCard";
import { FacebookConnect } from "@/components/integrations/FacebookConnect";
import { Skeleton } from "@/components/ui/skeleton";
import { Puzzle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Integration {
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
}

export default function IntegrationsPage(): JSX.Element {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  /**
   * Fetch integrations
   */
  const fetchIntegrations = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await integrationsApi.getAll();

      if (response.success && response.data) {
        setIntegrations(response.data);
      } else {
        setError(response.message || "Không thể tải danh sách tích hợp");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải danh sách tích hợp";
      setError(errorMessage);
      console.error("Failed to fetch integrations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle disconnect integration
   */
  const handleDisconnect = async (id: string): Promise<void> => {
    if (!confirm("Bạn có chắc muốn ngắt kết nối tích hợp này?")) {
      return;
    }

    setDisconnectingId(id);

    try {
      const response = await integrationsApi.disconnect(id);

      if (response.success) {
        toast.success("Đã ngắt kết nối thành công");
        // Refresh integrations list
        await fetchIntegrations();
      } else {
        toast.error(response.message || "Không thể ngắt kết nối");
      }
    } catch (error) {
      console.error("Failed to disconnect integration:", error);
      toast.error("Không thể ngắt kết nối");
    } finally {
      setDisconnectingId(null);
    }
  };

  /**
   * Handle Facebook connect
   */
  const handleFacebookConnect = (): void => {
    // Facebook OAuth will redirect, so we just need to reload on return
    // The actual connection is handled in the callback page
  };

  /**
   * Load integrations on mount
   */
  useEffect(() => {
    fetchIntegrations();
  }, []);

  // Check if Facebook is connected
  const hasFacebookIntegration = integrations.some(
    (integration) => integration.platform === "facebook"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tích hợp</h1>
        <p className="mt-2 text-gray-600">
          Kết nối các nền tảng để quản lý hội thoại từ nhiều kênh trong một dashboard
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Skeleton className="h-14 w-14 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-900">{error}</p>
        </div>
      )}

      {/* Integrations List */}
      {!isLoading && !error && (
        <div className="space-y-6">
          {/* Facebook Integration */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Facebook</h2>
            {hasFacebookIntegration ? (
              <div className="grid gap-4">
                {integrations
                  .filter((integration) => integration.platform === "facebook")
                  .map((integration) => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      onDisconnect={handleDisconnect}
                      isDisconnecting={disconnectingId === integration.id}
                    />
                  ))}
              </div>
            ) : (
              <FacebookConnect onConnect={handleFacebookConnect} />
            )}
          </div>

          {/* Other Platforms - Coming Soon */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Các nền tảng khác
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {["shopee", "tiktok", "lazada"].map((platform) => {
                const connectedIntegration = integrations.find(
                  (i) => i.platform === platform
                );

                if (connectedIntegration) {
                  return (
                    <IntegrationCard
                      key={connectedIntegration.id}
                      integration={connectedIntegration}
                      onDisconnect={handleDisconnect}
                      isDisconnecting={disconnectingId === connectedIntegration.id}
                    />
                  );
                }

                return (
                  <div
                    key={platform}
                    className="bg-gray-50 border border-dashed rounded-lg p-6 text-center"
                  >
                    <Puzzle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 capitalize">
                      {platform}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Sắp ra mắt</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Empty State */}
          {integrations.length === 0 && (
            <div className="text-center py-12">
              <Puzzle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có tích hợp nào
              </h3>
              <p className="text-sm text-gray-500">
                Kết nối nền tảng đầu tiên để bắt đầu nhận tin nhắn từ khách hàng
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
