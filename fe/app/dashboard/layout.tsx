/**
 * Dashboard Layout Wrapper
 * Wraps all dashboard pages with DashboardLayout and ConversationProvider
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ConversationProvider } from "@/contexts/ConversationContext";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <ConversationProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </ConversationProvider>
  );
}
