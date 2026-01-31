/**
 * Customer Info Component
 * Display customer details in profile panel
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getInitials } from "@/lib/utils";
import { Mail, Phone, ShoppingBag, DollarSign, Star } from "lucide-react";

interface CustomerInfoProps {
  customer: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
    customerSegment: string | null;
    totalOrders: number;
    totalOrderValue: number;
    customerLifetimeValue: number;
  };
}

const segmentLabels: Record<string, string> = {
  vip: "VIP",
  regular: "Khách hàng thường xuyên",
  potential: "Khách hàng tiềm năng",
  new: "Khách hàng mới",
};

const segmentColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  vip: "destructive",
  regular: "default",
  potential: "secondary",
  new: "outline",
};

export function CustomerInfo({ customer }: CustomerInfoProps): JSX.Element {
  return (
    <div className="space-y-4">
      {/* Avatar and Name */}
      <div className="flex flex-col items-center text-center pb-4 border-b">
        <Avatar className="h-20 w-20 mb-3">
          <AvatarImage
            src={customer.avatarUrl || undefined}
            alt={customer.name || ""}
          />
          <AvatarFallback className="bg-blue-600 text-white text-xl">
            {getInitials(customer.name || null)}
          </AvatarFallback>
        </Avatar>
        <h3 className="text-lg font-semibold text-gray-900">
          {customer.name || "Khách hàng"}
        </h3>
        {customer.customerSegment && (
          <Badge
            variant={segmentColors[customer.customerSegment] || "outline"}
            className="mt-2"
          >
            <Star className="h-3 w-3 mr-1" />
            {segmentLabels[customer.customerSegment] || customer.customerSegment}
          </Badge>
        )}
      </div>

      {/* Contact Information */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Thông tin liên hệ</h4>

        {customer.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{customer.email}</span>
          </div>
        )}

        {customer.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{customer.phone}</span>
          </div>
        )}

        {!customer.email && !customer.phone && (
          <p className="text-sm text-gray-400 italic">Chưa có thông tin liên hệ</p>
        )}
      </div>

      {/* Statistics */}
      <div className="space-y-3 pt-4 border-t">
        <h4 className="text-sm font-medium text-gray-700">Thống kê</h4>

        <div className="grid grid-cols-2 gap-3">
          {/* Total Orders */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Đơn hàng</span>
            </div>
            <p className="text-lg font-bold text-blue-900">
              {customer.totalOrders}
            </p>
          </div>

          {/* Total Order Value */}
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Tổng giá trị</span>
            </div>
            <p className="text-lg font-bold text-green-900">
              {formatCurrency(customer.totalOrderValue)}
            </p>
          </div>
        </div>

        {/* Customer Lifetime Value */}
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-4 w-4 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">
              Giá trị trọn đời
            </span>
          </div>
          <p className="text-xl font-bold text-purple-900">
            {formatCurrency(customer.customerLifetimeValue)}
          </p>
        </div>
      </div>
    </div>
  );
}
