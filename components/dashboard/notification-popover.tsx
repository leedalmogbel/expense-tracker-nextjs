"use client"

import { Bell, UserPlus, UserCheck, Receipt, CheckCheck, CreditCard, Target, ShoppingCart, MailOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { useNotifications } from "@/contexts/notification-context"
import { formatDistanceToNow, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const TYPE_ICON: Record<string, typeof UserPlus> = {
  invite_sent: UserPlus,
  invite_received: MailOpen,
  member_joined: UserCheck,
  transaction_added: Receipt,
  card_due: CreditCard,
  card_overdue: CreditCard,
  budget_threshold: Target,
  shopping_reminder: ShoppingCart,
}

const TYPE_COLOR: Record<string, string> = {
  invite_sent: "text-blue-500 bg-blue-500/10",
  invite_received: "text-violet-500 bg-violet-500/10",
  member_joined: "text-primary bg-primary/10",
  transaction_added: "text-emerald-500 bg-emerald-500/10",
  card_due: "text-amber-500 bg-amber-500/10",
  card_overdue: "text-destructive bg-destructive/10",
  budget_threshold: "text-orange-500 bg-orange-500/10",
  shopping_reminder: "text-blue-400 bg-blue-400/10",
}

export function NotificationPopover() {
  const router = useRouter()
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications()
  const hasNotifications = unreadCount > 0
  const badgeLabel = unreadCount >= 10 ? "9+" : String(unreadCount)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-11 w-11 rounded-xl text-muted-foreground hover:text-foreground xl:h-12 xl:w-12",
            hasNotifications && "text-foreground"
          )}
          aria-label={hasNotifications ? `${unreadCount} unread notifications` : "Notifications"}
        >
          <Bell className="h-5 w-5 xl:h-6 xl:w-6" />
          {hasNotifications && (
            <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold tabular-nums leading-none text-white ring-2 ring-background">
              {badgeLabel}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[22rem] rounded-xl border border-border p-0 shadow-xl sm:w-96">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive/10 px-1.5 text-[10px] font-bold tabular-nums text-destructive">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
              onClick={() => markAllRead()}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* List */}
        <div className="max-h-80 overflow-y-auto overscroll-contain">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                <Bell className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">No notifications</p>
                <p className="mt-0.5 text-xs text-muted-foreground/60">You&apos;re all caught up</p>
              </div>
            </div>
          ) : (
            notifications.map((n, i) => {
              const Icon = TYPE_ICON[n.type] ?? Bell
              const colorClass = TYPE_COLOR[n.type] ?? "text-muted-foreground bg-muted"
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id)
                    if (n.type === "invite_received") router.push("/dashboard/members")
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                    !n.read && "bg-primary/[0.04]",
                    i !== notifications.length - 1 && "border-b border-border/50"
                  )}
                >
                  <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm leading-tight", !n.read ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{n.message}</p>
                    <p className="mt-1.5 text-[11px] font-medium text-muted-foreground/50">
                      {formatDistanceToNow(parseISO(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
