import { WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="text-center space-y-5 max-w-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
          <WifiOff className="h-8 w-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold font-heading text-foreground">
          You&apos;re offline
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This page hasn&apos;t been cached yet. Check your internet connection
          and try again, or go back to the dashboard where your data is saved
          locally.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  )
}
