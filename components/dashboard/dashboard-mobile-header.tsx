"use client"

import { useRouter } from "next/navigation"
import { Moon, Sun, Settings, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react"
import { NotificationPopover } from "./notification-popover"

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

export function DashboardMobileHeader() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()

  const displayName = getUserDisplayName(user?.email, user?.user_metadata)
  const initials = getInitials(displayName, user?.email)

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-14 min-h-14 items-center gap-2 border-b border-border bg-background px-3 py-2 shadow-sm sm:px-4 lg:hidden"
      )}
    >
      <div className="flex-1 min-w-0">
        <span className="truncate text-base font-semibold text-foreground sm:text-sm">Dosh Mate</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-13 w-13 min-h-11 min-w-11 rounded-lg touch-manipulation active:scale-95"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-6 w-6 rotate-0 scale-100 dark:scale-0" />
          <Moon className="absolute h-6 w-6 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
        </Button>
        <NotificationPopover />

        {/* User avatar dropdown */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <button
              type="button"
              className="flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-lg touch-manipulation active:scale-95"
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="User menu"
            className="min-w-[12rem] bg-content1 rounded-xl shadow-lg p-2"
          >
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
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  )
}
