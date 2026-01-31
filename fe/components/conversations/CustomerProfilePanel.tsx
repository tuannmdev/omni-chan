/**
 * Customer Profile Panel Component
 * Right sidebar displaying customer information and purchase history
 */

import { CustomerInfo } from "@/components/customers/CustomerInfo";
import { PurchaseHistory } from "@/components/customers/PurchaseHistory";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerProfilePanelProps {
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
  } | null;
  isLoading?: boolean;
}

export function CustomerProfilePanel({
  customer,
  isLoading = false,
}: CustomerProfilePanelProps): JSX.Element {
  if (isLoading) {
    return (
      <div className="w-80 border-l bg-white p-6 space-y-6 overflow-y-auto">
        {/* Avatar skeleton */}
        <div className="flex flex-col items-center">
          <Skeleton className="h-20 w-20 rounded-full mb-3" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Contact info skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>

        {/* Stats skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="w-80 border-l bg-white p-6">
        <p className="text-sm text-gray-500 text-center">
          Không có thông tin khách hàng
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 border-l bg-white overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Customer Info */}
        <CustomerInfo customer={customer} />

        {/* Purchase History */}
        <div className="pt-6 border-t">
          <PurchaseHistory customerId={customer.id} orders={[]} />
        </div>
      </div>
    </div>
  );
}
