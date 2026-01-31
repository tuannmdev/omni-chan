/**
 * Customer Card Component
 * Individual customer item in list
 */

import Link from "next/link";
import { CustomerResponse } from "@/types/api/customer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getInitials } from "@/lib/utils";
import { Mail, Phone, ShoppingBag, Star, Facebook, MessageCircle } from "lucide-react";

interface CustomerCardProps {
  customer: CustomerResponse;
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

export function CustomerCard({ customer }: CustomerCardProps): JSX.Element {
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar className="h-14 w-14">
          <AvatarImage
            src={customer.avatarUrl || undefined}
            alt={customer.name || ""}
          />
          <AvatarFallback className="bg-blue-600 text-white text-lg">
            {getInitials(customer.name || null)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {customer.name || "Khách hàng"}
              </h3>

              {/* Contact Info */}
              <div className="flex flex-col gap-1 mt-1">
                {customer.email && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Phone className="h-3 w-3" />
                    <span>{customer.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Segment Badge */}
            {customer.customerSegment && (
              <Badge
                variant={segmentColors[customer.customerSegment] || "outline"}
                className="ml-2"
              >
                {segmentLabels[customer.customerSegment] || customer.customerSegment}
              </Badge>
            )}
          </div>

          {/* Platform Icons */}
          <div className="flex items-center gap-2 mb-3">
            {customer.facebookId && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Facebook className="h-3 w-3" />
                <span>Facebook</span>
              </div>
            )}
            {customer.shopeeId && (
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <MessageCircle className="h-3 w-3" />
                <span>Shopee</span>
              </div>
            )}
            {customer.tiktokId && (
              <div className="flex items-center gap-1 text-xs text-gray-900">
                <MessageCircle className="h-3 w-3" />
                <span>TikTok</span>
              </div>
            )}
            {customer.lazadaId && (
              <div className="flex items-center gap-1 text-xs text-purple-600">
                <MessageCircle className="h-3 w-3" />
                <span>Lazada</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {/* Total Conversations */}
            <div className="bg-gray-50 rounded p-2">
              <div className="flex items-center gap-1 mb-1">
                <MessageCircle className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600">Hội thoại</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {customer.totalConversations}
              </p>
            </div>

            {/* Total Orders */}
            <div className="bg-blue-50 rounded p-2">
              <div className="flex items-center gap-1 mb-1">
                <ShoppingBag className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-blue-600">Đơn hàng</span>
              </div>
              <p className="text-sm font-semibold text-blue-900">
                {customer.totalOrders}
              </p>
            </div>

            {/* Lifetime Value */}
            <div className="bg-green-50 rounded p-2">
              <div className="flex items-center gap-1 mb-1">
                <Star className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">CLV</span>
              </div>
              <p className="text-sm font-semibold text-green-900">
                {formatCurrency(customer.customerLifetimeValue)}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  customer.isActive ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span className="text-xs text-gray-500">
                {customer.isActive ? "Đang hoạt động" : "Không hoạt động"}
              </span>
            </div>

            <Link
              href={`/dashboard/customers/${customer.id}`}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem chi tiết →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
