"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Settings,
  LogOut,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/contexts/sidebar-context"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/transactions", icon: Receipt, label: "Transactions" },
  { href: "/dashboard/analytics", icon: PieChart, label: "Analytics" },
  { href: "/dashboard/budgets", icon: Target, label: "Budgets" },
  { href: "/dashboard/accounts", icon: CreditCard, label: "Accounts" },
]

const bottomItems = [
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

// Structure components (match sidebar structure: Header = sticky top, Content = scrollable, Footer = sticky bottom)

function SidebarHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn("shrink-0 border-b border-border bg-card", className)}>
      {children}
    </header>
  )
}

function SidebarContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex-1 min-h-0 overflow-y-auto overflow-x-hidden", className)}>
      {children}
    </div>
  )
}

function SidebarFooter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <footer className={cn("shrink-0 border-t border-border bg-card", className)}>
      {children}
    </footer>
  )
}

function SidebarGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-1", className)}>{children}</div>
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname, setMobileOpen])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  const linkBase =
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px] rounded-l-none border-l-2 border-l-transparent"
  const linkActive = "bg-accent text-accent-foreground border-l-primary"
  const linkInactive = "text-muted-foreground hover:bg-muted hover:text-foreground"
  const linkCollapsed = "justify-center px-0 w-full min-w-[44px] rounded-l-lg border-l-0"

  const renderNavLink = (
    item: (typeof navItems)[0],
    isActive: boolean,
    isCollapsed: boolean
  ) => {
    const linkContent = (
      <Link
        href={item.href}
        title={isCollapsed ? item.label : undefined}
        className={cn(
          linkBase,
          isActive ? linkActive : linkInactive,
          isCollapsed && linkCollapsed,
          isCollapsed && isActive && "bg-accent text-accent-foreground"
        )}
      >
        <item.icon className="h-6 w-6 shrink-0" aria-hidden />
        {!isCollapsed && <span>{item.label}</span>}
      </Link>
    )

    if (isCollapsed) {
      return (
        <Tooltip key={item.label}>
          <TooltipTrigger asChild>
            <div className="w-full flex items-center justify-center min-h-[44px]">
              {linkContent}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      )
    }
    return <div key={item.label}>{linkContent}</div>
  }

  const desktopHeader = (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 min-h-[56px]",
        collapsed ? "justify-center px-0" : ""
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card">
        <Image src="/assets/doshmate-logo.png" alt="Dosh Mate" width={40} height={40} className="object-contain" />
      </div>
      {!collapsed && (
        <span className="font-heading text-base font-semibold text-foreground truncate">Dosh Mate</span>
      )}
    </div>
  )

  const desktopContent = (
    <nav className="px-3 py-2">
      {!collapsed && (
        <p className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Dashboard
        </p>
      )}
      <SidebarGroup>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return renderNavLink(item, isActive, collapsed)
        })}
      </SidebarGroup>
    </nav>
  )

  const desktopFooter = (
    <div className="px-3 py-3">
      <SidebarGroup>
        {bottomItems.map((item) => {
          const isActive = pathname === item.href
          const content = (
            <Link
              key={item.label}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                linkBase,
                isActive ? linkActive : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && linkCollapsed,
                collapsed && isActive && "bg-accent text-accent-foreground"
              )}
            >
              <item.icon className="h-6 w-6 shrink-0" aria-hidden />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
          if (collapsed) {
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <div className="w-full flex items-center justify-center min-h-[44px]">
                    {content}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          }
          return <div key={item.label}>{content}</div>
        })}
      </SidebarGroup>
      <div
        className={cn(
          "mt-3 flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5",
          collapsed && "justify-center p-2"
        )}
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            JD
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@example.com</p>
            </div>
            <Link href="/" aria-label="Log out" className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="h-5 w-5" />
            </Link>
          </>
        )}
      </div>
    </div>
  )

  const collapseButton = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="absolute -right-3 top-20 z-10 size-9 min-w-9 min-h-9 !p-0 rounded-full border border-border bg-card shadow-md hover:bg-muted hover:border-muted-foreground/20 hidden lg:inline-flex items-center justify-center"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" aria-hidden />
          ) : (
            <ChevronLeft className="h-5 w-5" aria-hidden />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="font-medium">
        {collapsed ? "Expand sidebar" : "Collapse sidebar"}
      </TooltipContent>
    </Tooltip>
  )

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "fixed inset-0 z-[45] bg-black/50 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-hidden
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-[50] flex h-screen flex-col border-r border-border bg-card transition-[width,transform] duration-200 ease-out",
          "w-64",
          collapsed && "lg:w-[72px]",
          "lg:translate-x-0",
          "max-lg:shadow-xl max-lg:w-64",
          mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
        )}
      >
        {/* Mobile: sticky header with logo + close */}
        <SidebarHeader className="flex items-center justify-between p-3 lg:hidden min-h-[57px]">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card">
              <Image src="/assets/doshmate-logo.png" alt="Dosh Mate" width={40} height={40} className="object-contain" />
            </div>
            <span className="text-lg font-bold font-heading text-foreground">Dosh Mate</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </SidebarHeader>

        {/* Desktop: sticky header + scrollable content + sticky footer */}
        <div className="hidden lg:flex flex-col flex-1 min-h-0">
          <SidebarHeader>{desktopHeader}</SidebarHeader>
          <SidebarContent>{desktopContent}</SidebarContent>
          <SidebarFooter>{desktopFooter}</SidebarFooter>
        </div>

        {/* Mobile: scrollable nav + footer */}
        <div className="hidden max-lg:flex flex-1 flex-col min-h-0 overflow-hidden">
          <SidebarContent>
            <nav className="p-3 space-y-1">
              <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Dashboard
              </p>
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const linkContent = (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(linkBase, isActive ? linkActive : linkInactive)}
                  >
                    <item.icon className="h-6 w-6 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
                return <div key={item.label}>{linkContent}</div>
              })}
            </nav>
          </SidebarContent>
          <SidebarFooter>
            <div className="p-3">
              {bottomItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(linkBase, isActive ? linkActive : linkInactive)}
                  >
                    <item.icon className="h-6 w-6 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">John Doe</p>
                  <p className="text-xs text-muted-foreground truncate">john@example.com</p>
                </div>
                <Link href="/" aria-label="Log out">
                  <LogOut className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </Link>
              </div>
            </div>
          </SidebarFooter>
        </div>

        {collapseButton}
      </aside>
    </TooltipProvider>
  )
}
