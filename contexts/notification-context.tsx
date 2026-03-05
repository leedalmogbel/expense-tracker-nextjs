"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useAuth } from "./auth-context"
import { useExpense } from "./expense-context"
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
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
  const [localNotifications, setLocalNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadNotifications = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) return
    const { notifications: data } = await fetchNotifications(user.id)
    setSupabaseNotifications(data)
    setLoading(false)
  }, [user])

  // Initial load + polling for Supabase notifications
  useEffect(() => {
    if (!user || !isSupabaseConfigured()) {
      setSupabaseNotifications([])
      setLoading(false)
      return
    }

    loadNotifications()
    intervalRef.current = setInterval(loadNotifications, POLL_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [user, loadNotifications])

  // Generate local notifications from localStorage data
  useEffect(() => {
    const generate = () => {
      setLocalNotifications(generateAllLocalNotifications(budgetProgress))
    }
    generate()
    const id = setInterval(generate, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [budgetProgress])

  // Merge: local first (more urgent), then Supabase
  const allNotifications = useMemo(
    () => [...localNotifications, ...supabaseNotifications],
    [localNotifications, supabaseNotifications]
  )

  const unreadCount = allNotifications.filter((n) => !n.read).length

  const markAsRead = useCallback(
    async (id: string) => {
      if (id.startsWith("local-")) {
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
