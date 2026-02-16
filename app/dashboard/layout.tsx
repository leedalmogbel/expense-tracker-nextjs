import type { Metadata } from "next"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { SidebarProvider } from "@/contexts/sidebar-context"
import { DashboardActionsProvider } from "@/contexts/dashboard-actions-context"

export const metadata: Metadata = {
  title: "Dashboard - Dosh Mate",
  description: "Manage and track your expenses with Dosh Mate dashboard.",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarProvider>
        <DashboardActionsProvider>
          <DashboardSidebar />
          <DashboardContent>{children}</DashboardContent>
        </DashboardActionsProvider>
      </SidebarProvider>
    </div>
  )
}
