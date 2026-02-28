"use client"

import { Bell, UserPlus, UserCheck, Receipt, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { useNotifications } from "@/contexts/notification-context"
import { formatDistanceToNow, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

const TYPE_ICON: Record<string, typeof UserPlus> = {
  invite_sent: UserPlus,
  member_joined: UserCheck,
  transaction_added: Receipt,
}

const TYPE_COLOR: Record<string, string> = {
  invite_sent: "text-blue-500 bg-blue-500/10",
  member_joined: "text-primary bg-primary/10",
  transaction_added: "text-amber-500 bg-amber-500/10",
}

export function NotificationPopover() {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications()
  const hasNotifications = unreadCount > 0
  const badgeLabel = unreadCount >= 10 ? "9+" : String(unreadCount)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="relative inline-flex shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-xl xl:h-12 xl:w-12"
            aria-label={hasNotifications ? `${unreadCount} unread notifications` : "Notifications"}
          >
            <Bell className="h-5 w-5 px-0 xl:h-6 xl:w-6" />
          </Button>
          {hasNotifications && (
            <span
              className="absolute right-0 top-0 flex min-h-[1.375rem] min-w-[1.375rem] items-center justify-center rounded-full border-2 border-background bg-destructive px-1 text-[11px] font-semibold tabular-nums leading-none text-white"
              aria-hidden
            >
              {badgeLabel}
            </span>
          )}
        </span>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 p-0 sm:w-96">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => markAllRead()}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = TYPE_ICON[n.type] ?? Bell
              const colorClass = TYPE_COLOR[n.type] ?? "text-muted-foreground bg-muted"
              return (
                <button
                  key={n.id}
                  onClick={() => !n.read && markAsRead(n.id)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                    !n.read && "bg-primary/[0.03]"
                  )}
                >
                  <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground leading-tight">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground/60">
                      {formatDistanceToNow(parseISO(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
