/**
 * Product Recommendations Component
 * Display AI-recommended products with confidence scores
 */

import { ProductRecommendation } from "@/types/api/ai";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Package, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ProductRecommendationsProps {
  recommendations: ProductRecommendation[];
  onSendProduct?: (productId: string, productName: string) => void;
}

export function ProductRecommendations({
  recommendations,
  onSendProduct,
}: ProductRecommendationsProps): JSX.Element {
  const handleSendProduct = (productId: string, productName: string): void => {
    if (onSendProduct) {
      onSendProduct(productId, productName);
    } else {
      toast.success(`Đã sao chép thông tin sản phẩm: ${productName}`);
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">
            Sản phẩm đề xuất
          </h3>
        </div>
        <div className="text-center py-6">
          <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Chưa có đề xuất sản phẩm</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <h3 className="text-sm font-semibold text-gray-900">
          Sản phẩm đề xuất ({recommendations.length})
        </h3>
      </div>

      <div className="space-y-3">
        {recommendations.map((product, index) => (
          <div
            key={product.productId}
            className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow"
          >
            {/* Product Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  {product.productName}
                </h4>
                {product.price !== undefined && (
                  <p className="text-sm font-semibold text-blue-600">
                    {formatCurrency(product.price)}
                  </p>
                )}
              </div>
              {product.available !== undefined && (
                <Badge
                  variant={product.available ? "default" : "secondary"}
                  className="text-xs"
                >
                  {product.available ? "Còn hàng" : "Hết hàng"}
                </Badge>
              )}
            </div>

            {/* Reason */}
            <p className="text-xs text-gray-600 mb-3">{product.reason}</p>

            {/* Confidence Score */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-purple-500 h-1.5 rounded-full"
                  style={{ width: `${product.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 min-w-[3rem] text-right">
                {Math.round(product.confidence * 100)}% phù hợp
              </span>
            </div>

            {/* Send Button */}
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() => handleSendProduct(product.productId, product.productName)}
            >
              <Send className="h-3 w-3 mr-1" />
              Gửi cho khách hàng
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
