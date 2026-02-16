"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type SidebarContextValue = {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const value = React.useMemo(
    () => ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }),
    [collapsed, mobileOpen]
  )
  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider")
  return ctx
}

/** Main content area: fixed sidebar offset (left + top for fixed topbar on desktop). */
export function SidebarMain({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  return (
    <main
      className={cn(
        "relative z-0 w-full min-w-0 transition-[padding] duration-300",
        "pt-0 pr-3 lg:pr-6 lg:pt-20 lg:pb-8",
        collapsed ? "lg:pl-[72px]" : "lg:pl-64"
      )}
    >
      {children}
    </main>
  )
}
