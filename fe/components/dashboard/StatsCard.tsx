/**
 * Stats Card Component
 * Display metric with icon and trend
 */

import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatsCardProps): JSX.Element {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "mt-2 text-sm font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}% so với hôm qua
              </p>
            )}
          </div>
          <div className="ml-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
