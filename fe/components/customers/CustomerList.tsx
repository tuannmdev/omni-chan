/**
 * Customer List Component
 * List of customers with loading and empty states
 */

import { CustomerResponse } from "@/types/api/customer";
import { CustomerCard } from "./CustomerCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

interface CustomerListProps {
  customers: CustomerResponse[];
  isLoading: boolean;
}

export function CustomerList({
  customers,
  isLoading,
}: CustomerListProps): JSX.Element {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white border rounded-lg p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-dashed p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-gray-100 p-3">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chưa có khách hàng nào
        </h3>
        <p className="text-sm text-gray-500">
          Khách hàng sẽ xuất hiện ở đây khi có người liên hệ qua các nền tảng
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  );
}
