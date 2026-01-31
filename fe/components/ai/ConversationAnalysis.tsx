/**
 * Conversation Analysis Component
 * Display AI analysis of conversation: intent, sentiment, urgency, purchase probability
 */

import { ConversationAnalysis as AnalysisType } from "@/types/api/ai";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Heart,
  TrendingUp,
  AlertCircle,
  Tag,
} from "lucide-react";

interface ConversationAnalysisProps {
  analysis: AnalysisType;
}

const intentLabels: Record<string, string> = {
  product_inquiry: "Hỏi về sản phẩm",
  support_request: "Yêu cầu hỗ trợ",
  complaint: "Khiếu nại",
  order_status: "Tra cứu đơn hàng",
  pricing_question: "Hỏi giá",
  general_question: "Câu hỏi chung",
  feedback: "Phản hồi",
  other: "Khác",
};

const sentimentLabels = {
  positive: "😊 Tích cực",
  neutral: "😐 Trung tính",
  negative: "😞 Tiêu cực",
};

const sentimentColors = {
  positive: "text-green-700 bg-green-50 border-green-200",
  neutral: "text-gray-700 bg-gray-50 border-gray-200",
  negative: "text-red-700 bg-red-50 border-red-200",
};

const urgencyLabels = {
  low: "Thấp",
  normal: "Bình thường",
  high: "Cao",
  critical: "Khẩn cấp",
};

const urgencyColors = {
  low: "text-gray-700 bg-gray-50 border-gray-200",
  normal: "text-blue-700 bg-blue-50 border-blue-200",
  high: "text-orange-700 bg-orange-50 border-orange-200",
  critical: "text-red-700 bg-red-50 border-red-200",
};

export function ConversationAnalysis({
  analysis,
}: ConversationAnalysisProps): JSX.Element {
  const purchasePercentage = Math.round(analysis.purchaseProbability * 100);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Phân tích AI</h3>

      {/* Summary */}
      {analysis.summary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-900">{analysis.summary}</p>
        </div>
      )}

      {/* Intent */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-700">Ý định</span>
        </div>
        <Badge variant="outline" className="text-sm">
          {intentLabels[analysis.intent] || analysis.intent}
        </Badge>
      </div>

      {/* Sentiment */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-700">Cảm xúc</span>
        </div>
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
            sentimentColors[analysis.sentiment]
          }`}
        >
          {sentimentLabels[analysis.sentiment]}
        </div>
      </div>

      {/* Purchase Probability */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-700">
            Khả năng mua hàng
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                purchasePercentage >= 70
                  ? "bg-green-500"
                  : purchasePercentage >= 40
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${purchasePercentage}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-900 min-w-[3rem] text-right">
            {purchasePercentage}%
          </span>
        </div>
      </div>

      {/* Urgency Level */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-700">Độ khẩn cấp</span>
        </div>
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
            urgencyColors[analysis.urgencyLevel]
          }`}
        >
          {urgencyLabels[analysis.urgencyLevel]}
        </div>
      </div>

      {/* Keywords */}
      {analysis.keywords && analysis.keywords.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Từ khóa</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
