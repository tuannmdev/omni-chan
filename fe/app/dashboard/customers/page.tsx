"use client";

/**
 * Customers Page
 * View and manage customer list with filters and search
 */

import { useEffect, useState } from "react";
import { customersApi } from "@/lib/api/endpoints/customers";
import { CustomerResponse } from "@/types/api/customer";
import { CustomerList } from "@/components/customers/CustomerList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface Filters {
  segment?: string;
  platform?: string;
  search?: string;
  page: number;
  limit: number;
}

export default function CustomersPage(): JSX.Element {
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  /**
   * Fetch customers with filters
   */
  const fetchCustomers = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await customersApi.getAll(filters);

      if (response.success) {
        setCustomers(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load customers on mount and when filters change
   */
  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  /**
   * Handle segment filter change
   */
  const handleSegmentChange = (segment: string): void => {
    setFilters({
      ...filters,
      segment: segment === "all" ? undefined : segment,
      page: 1,
    });
  };

  /**
   * Handle platform filter change
   */
  const handlePlatformChange = (platform: string): void => {
    setFilters({
      ...filters,
      platform: platform === "all" ? undefined : platform,
      page: 1,
    });
  };

  /**
   * Handle search
   */
  const handleSearch = (): void => {
    setFilters({
      ...filters,
      search: searchInput.trim() || undefined,
      page: 1,
    });
  };

  /**
   * Handle search on Enter key
   */
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  /**
   * Pagination handlers
   */
  const handlePreviousPage = (): void => {
    if (pagination && filters.page > 1) {
      setFilters({ ...filters, page: filters.page - 1 });
    }
  };

  const handleNextPage = (): void => {
    if (pagination && filters.page < pagination.totalPages) {
      setFilters({ ...filters, page: filters.page + 1 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Khách hàng</h1>
        <p className="mt-2 text-gray-600">
          Quản lý và theo dõi thông tin khách hàng từ tất cả các nền tảng
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <Label htmlFor="search" className="text-sm font-medium mb-2">
              Tìm kiếm
            </Label>
            <div className="flex gap-2">
              <Input
                id="search"
                placeholder="Tìm theo tên, email, số điện thoại..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Segment Filter */}
          <div>
            <Label htmlFor="segment-filter" className="text-sm font-medium mb-2">
              Phân khúc
            </Label>
            <Select
              value={filters.segment || "all"}
              onValueChange={handleSegmentChange}
            >
              <SelectTrigger id="segment-filter">
                <SelectValue placeholder="Tất cả phân khúc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="regular">Khách hàng thường xuyên</SelectItem>
                <SelectItem value="potential">Khách hàng tiềm năng</SelectItem>
                <SelectItem value="new">Khách hàng mới</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Platform Filter */}
          <div>
            <Label htmlFor="platform-filter" className="text-sm font-medium mb-2">
              Nền tảng
            </Label>
            <Select
              value={filters.platform || "all"}
              onValueChange={handlePlatformChange}
            >
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
      </div>

      {/* Customer List */}
      <CustomerList customers={customers} isLoading={isLoading} />

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
                <span className="font-medium">{pagination.total}</span> khách hàng
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
