"use client"

import Link from "next/link"
import { Menu, Bell, Settings, Plus, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/contexts/sidebar-context"
import { useDashboardActions } from "@/contexts/dashboard-actions-context"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface DashboardMobileHeaderProps {
  /** Unread notification count; 0 = no badge */
  notificationCount?: number
}

export function DashboardMobileHeader({ notificationCount = 3 }: DashboardMobileHeaderProps) {
  const { setMobileOpen } = useSidebar()
  const { openAddModalRef } = useDashboardActions()
  const { theme, setTheme } = useTheme()
  const hasNotifications = notificationCount > 0
  const badgeLabel = notificationCount >= 10 ? "9+" : String(notificationCount)

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-14 min-h-14 items-center gap-2 border-b border-border bg-background px-3 py-2 shadow-sm sm:px-4 lg:hidden"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-11 min-h-11 min-w-11 shrink-0 rounded-xl touch-manipulation"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6 text-foreground" aria-hidden />
      </Button>

      <div className="flex-1 min-w-0" aria-hidden>
        <span className="truncate text-base font-semibold text-foreground sm:text-sm">Dosh Mate</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-13 w-13 min-h-11 min-w-11 rounded-xl touch-manipulation"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-6 w-6 rotate-0 scale-100 dark:scale-0" />
          <Moon className="absolute h-6 w-6 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
        </Button>
        <span className="relative inline-flex shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-13 w-13 min-h-11 min-w-11 rounded-xl touch-manipulation"
            aria-label={hasNotifications ? `${notificationCount} unread notifications` : "Notifications"}
          >
            <Bell className="h-6 w-6 px-0" />
          </Button>
          {hasNotifications && (
            <span
              className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-destructive px-1 text-[10px] font-semibold tabular-nums leading-none text-white sm:h-5 sm:min-w-5"
              aria-hidden
            >
              {badgeLabel}
            </span>
          )}
        </span>
        {/* <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg" asChild>
          <Link href="/dashboard/settings" aria-label="Settings">
            <Settings className="h-5 w-5 text-foreground" />
          </Link>
        </Button>
        <Button
          size="default"
          className="h-9 gap-1.5 rounded-lg px-3 text-sm font-medium"
          onClick={() => openAddModalRef.current?.()}
        >
          <Plus className="h-4 w-4" />
          Add
        </Button> */}
      </div>
    </header>
  )
}
