"use client"

import { AdminAuthGuard } from "@/components/auth/admin-auth-guard"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 ml-60 overflow-y-auto">
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  )
}
