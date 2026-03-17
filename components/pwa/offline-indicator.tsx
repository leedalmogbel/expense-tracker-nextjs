"use client"

import { useState, useEffect } from "react"
import { WifiOff, X } from "lucide-react"

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setIsOffline(!navigator.onLine)

    const handleOffline = () => {
      setIsOffline(true);
      setDismissed(false);
    }
    const handleOnline = () => {
      setIsOffline(false);
      setDismissed(false);
    }

    window.addEventListener("offline", handleOffline)
    window.addEventListener("online", handleOnline)

    return () => {
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  if (!isOffline || dismissed) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 shadow-md">
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>You&apos;re offline &mdash; changes are saved locally</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="ml-2 shrink-0 rounded-md p-0.5 hover:bg-white/20 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
