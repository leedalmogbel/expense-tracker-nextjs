import type { Metadata } from "next"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { SidebarProvider } from "@/contexts/sidebar-context"
import { DashboardActionsProvider } from "@/contexts/dashboard-actions-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { DashboardAuthGuard } from "@/components/auth/dashboard-auth-guard"
import { LoadCloudData } from "@/components/auth/load-cloud-data"

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
    <DashboardAuthGuard>
      <LoadCloudData />
      <div className="flex min-h-screen bg-background">
        <SidebarProvider>
          <DashboardActionsProvider>
            <NotificationProvider>
              <DashboardSidebar />
              <DashboardContent>{children}</DashboardContent>
            </NotificationProvider>
          </DashboardActionsProvider>
        </SidebarProvider>
      </div>
    </DashboardAuthGuard>
  )
}
