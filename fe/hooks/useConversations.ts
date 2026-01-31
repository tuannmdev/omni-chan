/**
 * useConversations Hook
 * Custom hook to access conversation context
 */

import { useContext } from "react";
import { ConversationContext } from "@/contexts/ConversationContext";

export function useConversations() {
  const context = useContext(ConversationContext);

  if (context === undefined) {
    throw new Error(
      "useConversations must be used within a ConversationProvider"
    );
  }

  return context;
}
