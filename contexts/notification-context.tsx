"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "./auth-context"
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type AppNotification,
} from "@/lib/supabase-api"
import { isSupabaseConfigured } from "@/lib/supabase"

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
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadNotifications = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) return
    const { notifications: data } = await fetchNotifications(user.id)
    setNotifications(data)
    setLoading(false)
  }, [user])

  // Initial load + polling
  useEffect(() => {
    if (!user || !isSupabaseConfigured()) {
      setNotifications([])
      setLoading(false)
      return
    }

    loadNotifications()
    intervalRef.current = setInterval(loadNotifications, POLL_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [user, loadNotifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = useCallback(
    async (id: string) => {
      await markNotificationRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    },
    []
  )

  const markAllRead = useCallback(async () => {
    if (!user) return
    await markAllNotificationsRead(user.id)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [user])

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, markAsRead, markAllRead, refresh: loadNotifications }}
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
