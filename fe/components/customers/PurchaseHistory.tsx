/**
 * Purchase History Component
 * Display customer's order history
 */

import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Package } from "lucide-react";

interface PurchaseHistoryItem {
  id: string;
  orderDate: Date;
  totalAmount: number;
  status: string;
  platform: string;
  items?: number;
}

interface PurchaseHistoryProps {
  customerId: string;
  orders?: PurchaseHistoryItem[];
}

const statusLabels: Record<string, string> = {
  completed: "Hoàn thành",
  pending: "Đang xử lý",
  cancelled: "Đã hủy",
  delivered: "Đã giao",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  pending: "secondary",
  cancelled: "destructive",
  delivered: "outline",
};

export function PurchaseHistory({ customerId, orders = [] }: PurchaseHistoryProps): JSX.Element {
  if (orders.length === 0) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Lịch sử mua hàng</h4>
        <div className="text-center py-8">
          <div className="flex justify-center mb-3">
            <div className="rounded-full bg-gray-100 p-3">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Chưa có lịch sử mua hàng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">
        Lịch sử mua hàng ({orders.length})
      </h4>

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
          >
            {/* Order Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {formatDate(order.orderDate)}
                </span>
              </div>
              <Badge variant={statusVariants[order.status] || "outline"} className="text-xs">
                {statusLabels[order.status] || order.status}
              </Badge>
            </div>

            {/* Order Details */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(order.totalAmount)}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="capitalize">{order.platform}</span>
                {order.items && (
                  <>
                    <span>•</span>
                    <span>{order.items} sản phẩm</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
