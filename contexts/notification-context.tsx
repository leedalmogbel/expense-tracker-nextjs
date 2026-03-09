"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useAuth } from "./auth-context"
import { useExpense } from "./expense-context"
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getPendingInvitesForEmail,
  type AppNotification,
} from "@/lib/supabase-api"
import { isSupabaseConfigured } from "@/lib/supabase"
import { generateAllLocalNotifications, dismissLocalNotification } from "@/lib/local-notifications"

const POLL_INTERVAL = 30_000 // 30 seconds

type NotificationContextValue = {
  notifications: AppNotification[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  refresh: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { budgetProgress } = useExpense()
  const [supabaseNotifications, setSupabaseNotifications] = useState<AppNotification[]>([])
  const [inviteNotifications, setInviteNotifications] = useState<AppNotification[]>([])
  const [localNotifications, setLocalNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadNotifications = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) return
    const { notifications: data } = await fetchNotifications(user.id)
    setSupabaseNotifications(data)
    setLoading(false)
  }, [user])

  // Fetch pending invites and surface them as notifications
  const loadInviteNotifications = useCallback(async () => {
    if (!user?.email || !isSupabaseConfigured()) return
    const { invites } = await getPendingInvitesForEmail(user.email)
    const inviteNotifs: AppNotification[] = invites.map((inv) => ({
      id: `invite-${inv.id}`,
      user_id: user.id,
      household_id: inv.household_id,
      type: "invite_received" as AppNotification["type"],
      title: `Invitation to ${inv.households?.name ?? "a household"}`,
      message: `You (${inv.email}) have been invited to join as ${inv.role}. Tap to view.`,
      actor_name: null,
      read: false,
      created_at: new Date().toISOString(),
    }))
    setInviteNotifications(inviteNotifs)
  }, [user])

  // Initial load + polling for Supabase notifications
  useEffect(() => {
    if (!user || !isSupabaseConfigured()) {
      setSupabaseNotifications([])
      setLoading(false)
      return
    }

    loadNotifications()
    loadInviteNotifications()
    intervalRef.current = setInterval(() => {
      loadNotifications()
      loadInviteNotifications()
    }, POLL_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [user, loadNotifications, loadInviteNotifications])

  // Generate local notifications from localStorage data
  useEffect(() => {
    const generate = () => {
      setLocalNotifications(generateAllLocalNotifications(budgetProgress))
    }
    generate()
    const id = setInterval(generate, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [budgetProgress])

  // Merge: invites first (actionable), then local (urgent), then Supabase
  const allNotifications = useMemo(
    () => [...inviteNotifications, ...localNotifications, ...supabaseNotifications],
    [inviteNotifications, localNotifications, supabaseNotifications]
  )

  const unreadCount = allNotifications.filter((n) => !n.read).length

  const markAsRead = useCallback(
    async (id: string) => {
      if (id.startsWith("invite-")) {
        // Invite notifications are always unread until accepted; just mark locally
        setInviteNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      } else if (id.startsWith("local-")) {
        dismissLocalNotification(id)
        setLocalNotifications((prev) => prev.filter((n) => n.id !== id))
      } else {
        await markNotificationRead(id)
        setSupabaseNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      }
    },
    []
  )

  const markAllRead = useCallback(async () => {
    // Dismiss all local
    for (const n of localNotifications) {
      dismissLocalNotification(n.id)
    }
    setLocalNotifications([])
    // Mark all Supabase as read
    if (user) {
      await markAllNotificationsRead(user.id)
      setSupabaseNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }
  }, [user, localNotifications])

  return (
    <NotificationContext.Provider
      value={{ notifications: allNotifications, unreadCount, loading, markAsRead, markAllRead, refresh: loadNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      markAsRead: async () => {},
      markAllRead: async () => {},
      refresh: async () => {},
    }
  }
  return ctx
}
