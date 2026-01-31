"use client";

/**
 * Facebook Connect Component
 * Handle Facebook OAuth flow and page selection
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Facebook, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface FacebookConnectProps {
  onConnect: () => void;
}

export function FacebookConnect({ onConnect }: FacebookConnectProps): JSX.Element {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleConnect = (): void => {
    setIsConnecting(true);

    try {
      // Get Facebook App ID from environment
      const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
      const redirectUri = `${window.location.origin}/dashboard/integrations/facebook/callback`;

      if (!facebookAppId) {
        toast.error("Thiếu cấu hình Facebook App ID");
        setIsConnecting(false);
        return;
      }

      // Build Facebook OAuth URL
      const scope = "pages_messaging,pages_read_engagement,pages_manage_metadata";
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=${scope}&response_type=code`;

      // Redirect to Facebook OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error("Failed to initiate Facebook connection:", error);
      toast.error("Không thể kết nối với Facebook");
      setIsConnecting(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-dashed rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <Facebook className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Kết nối Facebook Page
        </h3>
        <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
          Kết nối Facebook Page của bạn để nhận và trả lời tin nhắn từ khách hàng
          trực tiếp trong Omni-chan
        </p>

        <div className="flex gap-3 justify-center">
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Facebook className="h-4 w-4 mr-2" />
            {isConnecting ? "Đang kết nối..." : "Kết nối Facebook"}
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowInstructions(true)}
          >
            Hướng dẫn
          </Button>
        </div>
      </div>

      {/* Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Hướng dẫn kết nối Facebook Page</DialogTitle>
            <DialogDescription>
              Làm theo các bước sau để kết nối Facebook Page của bạn
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Nhấn nút "Kết nối Facebook"
                </h4>
                <p className="text-sm text-gray-600">
                  Bạn sẽ được chuyển đến trang đăng nhập Facebook
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Đăng nhập và cấp quyền
                </h4>
                <p className="text-sm text-gray-600">
                  Đăng nhập với tài khoản Facebook quản lý Page của bạn và cấp các
                  quyền cần thiết
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Chọn Page cần kết nối
                </h4>
                <p className="text-sm text-gray-600">
                  Chọn Facebook Page mà bạn muốn nhận tin nhắn từ khách hàng
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Hoàn tất!</h4>
                <p className="text-sm text-gray-600">
                  Tin nhắn từ khách hàng sẽ tự động xuất hiện trong dashboard
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Lưu ý:</strong> Bạn cần có quyền quản trị (Admin) hoặc biên
              tập (Editor) trên Facebook Page để có thể kết nối.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
