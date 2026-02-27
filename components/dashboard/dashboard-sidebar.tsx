"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
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
  User,
  ChevronUp,
  Wallet,
  BanknoteArrowUp,
  ShoppingBasket,
  EllipsisVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/contexts/sidebar-context"
import { useAuth } from "@/contexts/auth-context"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button as HeroUIButton,
} from "@heroui/react"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/transactions", icon: Receipt, label: "Transactions" },
  { href: "/dashboard/analytics", icon: PieChart, label: "Analytics" },
  { href: "/dashboard/budgets", icon: Target, label: "Budgets" },
  { href: "/dashboard/income", icon: BanknoteArrowUp, label: "Income" },
  { href: "/dashboard/cards", icon: CreditCard, label: "Cards" },
  { href: "/dashboard/shopping-trips", icon: ShoppingBasket, label: "Trips" },
]

// Mobile: 4 primary tabs + "More" popover for the rest
const mobileTabItems = navItems.slice(0, 4)
const mobileMoreItems = navItems.slice(4)

function getUserDisplayName(email: string | undefined, metadata?: { full_name?: string; name?: string } | null): string {
  if (metadata?.full_name?.trim()) return metadata.full_name.trim()
  if (metadata?.name?.trim()) return metadata.name.trim()
  if (email) return email.split("@")[0]
  return "Account"
}

function getInitials(displayName: string, email: string | undefined): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2)
  if (displayName.length >= 2) return displayName.slice(0, 2).toUpperCase()
  if (email) return email[0].toUpperCase()
  return "?"
}

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

function MobileTabBar({ pathname }: { pathname: string }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  const moreIsActive = mobileMoreItems.some((item) => pathname === item.href)

  // Close popover on outside click
  useEffect(() => {
    if (!moreOpen) return
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener("pointerdown", handleClick)
    return () => document.removeEventListener("pointerdown", handleClick)
  }, [moreOpen])

  // Close on route change
  const closeMore = useCallback(() => setMoreOpen(false), [])
  useEffect(() => { closeMore() }, [pathname, closeMore])

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[50] border-t border-border/80 bg-card/95 backdrop-blur-2xl shadow-[0_-1px_3px_0_rgb(0,0,0,0.03)] dark:bg-card/80 dark:border-white/[0.08] dark:shadow-[0_-2px_8px_0_rgb(0,0,0,0.3)] lg:hidden pb-[env(safe-area-inset-bottom)]"
      role="tablist"
    >
      <div className="flex items-end justify-around">
        {mobileTabItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 min-w-0 flex-1 transition-colors touch-manipulation active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "stroke-[2.5]")} aria-hidden />
              <span className={cn("text-[10px] leading-tight truncate max-w-full", isActive ? "font-semibold" : "font-medium")}>{item.label}</span>
            </Link>
          )
        })}

        {/* More button */}
        <div ref={moreRef} className="relative flex-1 flex justify-center">
          <button
            type="button"
            role="tab"
            aria-selected={moreIsActive}
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((o) => !o)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 w-full transition-colors touch-manipulation active:scale-95",
              moreIsActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <EllipsisVertical className={cn("h-5 w-5 shrink-0", moreIsActive && "stroke-[2.5]")} aria-hidden />
            <span className={cn("text-[10px] leading-tight", moreIsActive ? "font-semibold" : "font-medium")}>More</span>
          </button>

          {/* Popover */}
          {moreOpen && (
            <div className="absolute bottom-full mb-2 right-0 min-w-[160px] rounded-xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-lg shadow-black/[0.06] dark:bg-card/90 dark:border-white/[0.1] dark:shadow-xl dark:shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
              {mobileMoreItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "text-primary bg-accent"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { collapsed, setCollapsed } = useSidebar()
  const displayName = getUserDisplayName(user?.email, user?.user_metadata)
  const initials = getInitials(displayName, user?.email)
  const userEmail = user?.email ?? null

  const linkBase =
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all min-h-[44px] rounded-l-none border-l-2 border-l-transparent active:scale-[0.97]"
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

  const userMenuItems = (
    <>
      <DropdownItem
        key="settings"
        startContent={<Settings className="h-4 w-4 shrink-0" />}
        onPress={() => router.push("/dashboard/settings")}
        className="py-2"
      >
        Settings
      </DropdownItem>
      <DropdownItem
        key="profile"
        startContent={<User className="h-4 w-4 shrink-0" />}
        onPress={() => router.push("/dashboard/settings")}
        className="py-2"
      >
        Profile
      </DropdownItem>
      <DropdownItem
        key="logout"
        startContent={<LogOut className="h-4 w-4 shrink-0" />}
        onPress={async () => {
          await signOut()
          router.push("/login")
        }}
        className="py-2 text-destructive"
        color="danger"
      >
        Log out
      </DropdownItem>
    </>
  )

  const userTrigger = (
    <HeroUIButton
      variant="flat"
      className={cn(
        "w-full justify-start gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 min-h-[52px] h-auto",
        collapsed && "justify-center p-2 min-w-0 w-full"
      )}
      aria-label="User menu"
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      {!collapsed && (
        <>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail || "Not signed in"}</p>
          </div>
          <ChevronUp className="h-4 w-4 shrink-0 rotate-180 text-muted-foreground" />
        </>
      )}
    </HeroUIButton>
  )

  const desktopFooter = (
    <div className="px-3 py-3">
      <Dropdown placement="top-start" className="w-full">
        <DropdownTrigger>{userTrigger}</DropdownTrigger>
        <DropdownMenu aria-label="User menu" className="min-w-[12rem] bg-content1 rounded-xl shadow-lg p-2">
          {userMenuItems}
        </DropdownMenu>
      </Dropdown>
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
      {/* ── Desktop sidebar ────────────────────────────────── */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-[50] hidden lg:flex h-screen flex-col border-r border-border/80 bg-card/95 backdrop-blur-2xl shadow-sm shadow-black/[0.02] transition-[width] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] dark:bg-card/80 dark:border-white/[0.08] dark:shadow-xl dark:shadow-black/25",
          "w-64",
          collapsed && "lg:w-[72px]"
        )}
      >
        <SidebarHeader>{desktopHeader}</SidebarHeader>
        <SidebarContent>{desktopContent}</SidebarContent>
        <SidebarFooter>{desktopFooter}</SidebarFooter>
        {collapseButton}
      </aside>

      {/* ── Mobile bottom tab bar ──────────────────────────── */}
      <MobileTabBar pathname={pathname} />
    </TooltipProvider>
  )
}
