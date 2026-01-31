"use client";

/**
 * Conversation Detail Page
 * View and interact with a specific conversation
 */

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import { usePolling } from "@/hooks/usePolling";
import { useAISuggestions } from "@/hooks/useAISuggestions";
import { conversationsApi } from "@/lib/api/endpoints/conversations";
import { MessageThread } from "@/components/conversations/MessageThread";
import { MessageInput } from "@/components/conversations/MessageInput";
import { CustomerProfilePanel } from "@/components/conversations/CustomerProfilePanel";
import { AISuggestionsPanel } from "@/components/ai/AISuggestionsPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ConversationDetailPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const { user } = useAuth();
  const { activeConversation, selectConversation, refreshConversation, isLoading } =
    useConversations();
  const {
    suggestions,
    isLoading: isLoadingAI,
    error: aiError,
    fetchSuggestions,
    clearSuggestions,
  } = useAISuggestions();
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Load conversation and AI suggestions on mount
   */
  useEffect(() => {
    if (conversationId) {
      selectConversation(conversationId);
      fetchSuggestions(conversationId);
    }

    return () => {
      clearSuggestions();
    };
  }, [conversationId, selectConversation, fetchSuggestions, clearSuggestions]);

  /**
   * Poll for new messages every 5 seconds
   */
  usePolling(
    async () => {
      if (conversationId) {
        await refreshConversation(conversationId);
      }
    },
    {
      interval: 5000,
      enabled: !!conversationId && !!activeConversation,
    }
  );

  /**
   * Poll for AI suggestions every 10 seconds
   */
  usePolling(
    async () => {
      if (conversationId) {
        await fetchSuggestions(conversationId);
      }
    },
    {
      interval: 10000,
      enabled: !!conversationId && !!activeConversation,
    }
  );

  /**
   * Send message handler
   */
  const handleSendMessage = async (message: string): Promise<void> => {
    if (!conversationId) return;

    setIsSendingMessage(true);
    try {
      await conversationsApi.sendMessage(conversationId, message);
      // Refresh conversation to get the new message
      await refreshConversation(conversationId);
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    } finally {
      setIsSendingMessage(false);
    }
  };

  /**
   * Navigate back to conversations list
   */
  const handleBack = (): void => {
    router.push("/dashboard/conversations");
  };

  /**
   * Handle copy response suggestion to message input
   */
  const handleCopyResponse = (text: string): void => {
    // For now, just copy to clipboard
    // In the future, we could insert into message input
    navigator.clipboard.writeText(text);
  };

  /**
   * Handle send product recommendation to customer
   */
  const handleSendProduct = async (
    productId: string,
    productName: string
  ): Promise<void> => {
    if (!conversationId) return;

    try {
      // Format product message
      const message = `Xin chào! Tôi xin giới thiệu sản phẩm: ${productName}\n\nBạn có muốn biết thêm thông tin chi tiết không?`;

      // Send message
      await conversationsApi.sendMessage(conversationId, message);
      await refreshConversation(conversationId);

      toast.success("Đã gửi thông tin sản phẩm cho khách hàng");
    } catch (error) {
      console.error("Failed to send product:", error);
      toast.error("Không thể gửi sản phẩm");
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* AI Suggestions Panel */}
      <AISuggestionsPanel
        suggestions={suggestions}
        isLoading={isLoadingAI}
        error={aiError}
        onCopyResponse={handleCopyResponse}
        onSendProduct={handleSendProduct}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {activeConversation && activeConversation.customer ? (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {activeConversation.customer.name || "Khách hàng"}
              </h2>
              <p className="text-sm text-gray-500">
                {activeConversation.platform.charAt(0).toUpperCase() +
                  activeConversation.platform.slice(1)}
                {activeConversation.messageCount > 0 && (
                  <span> • {activeConversation.messageCount} tin nhắn</span>
                )}
              </p>
            </div>
          ) : (
            <div className="h-12 flex items-center">
              <span className="text-gray-500">Đang tải...</span>
            </div>
          )}
        </div>

        {/* Messages Thread */}
        <MessageThread
          messages={activeConversation?.messages || []}
          currentUserId={user?.id || null}
          isLoading={isLoading && !activeConversation}
        />

        {/* Message Input */}
        {activeConversation && (
          <MessageInput
            conversationId={conversationId}
            onSendMessage={handleSendMessage}
            disabled={isSendingMessage}
          />
        )}
      </div>

      {/* Customer Profile Panel */}
      <CustomerProfilePanel
        customer={activeConversation?.customer || null}
        isLoading={isLoading && !activeConversation}
      />
    </div>
  );
}
