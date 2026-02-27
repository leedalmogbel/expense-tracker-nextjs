"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpense } from "@/contexts/expense-context"
import { ShoppingCart, ShoppingBag, ChevronRight, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { ShoppingTrip, TripType } from "@/lib/types"

interface ShoppingTripsListProps {
  trips: ShoppingTrip[]
  onStartTrip: (type: TripType) => void
  onViewTrip: (tripId: string) => void
}

export function ShoppingTripsList({ trips, onStartTrip, onViewTrip }: ShoppingTripsListProps) {
  const { formatCurrency } = useExpense()

  const completedTrips = trips
    .filter((t) => t.status === "completed")
    .sort((a, b) => (b.completedAt ?? b.createdAt).localeCompare(a.completedAt ?? a.createdAt))

  return (
    <div className="space-y-6">
      {/* Start Trip buttons */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onStartTrip("grocery")}
          className="flex items-center gap-4 rounded-xl border border-border bg-card/80 backdrop-blur-xl p-5 transition-all duration-300 hover:bg-muted/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20 active:scale-[0.98] group text-left"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Grocery Trip</p>
            <p className="text-xs text-muted-foreground mt-0.5">Start tracking grocery items</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onStartTrip("shopping")}
          className="flex items-center gap-4 rounded-xl border border-border bg-card/80 backdrop-blur-xl p-5 transition-all duration-300 hover:bg-muted/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20 active:scale-[0.98] group text-left"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))] transition-all duration-300 group-hover:bg-[hsl(var(--chart-2))] group-hover:text-white group-hover:scale-110">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Shopping Trip</p>
            <p className="text-xs text-muted-foreground mt-0.5">Start tracking shopping items</p>
          </div>
        </button>
      </div>

      {/* Past Trips */}
      <Card className="border-border">
        <CardHeader className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                Past Trips
              </CardTitle>
              {completedTrips.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {completedTrips.length} trip{completedTrips.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-0">
          {completedTrips.length === 0 ? (
            <div className="px-4 py-10 sm:px-6 sm:py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                <ClipboardList className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No trips yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start a grocery or shopping trip above</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {completedTrips.map((trip, i) => {
                const total = trip.items.reduce((sum, item) => sum + item.price, 0)
                const isGrocery = trip.type === "grocery"
                const Icon = isGrocery ? ShoppingCart : ShoppingBag
                const iconBg = isGrocery
                  ? "bg-primary/10 text-primary"
                  : "bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]"

                return (
                  <motion.button
                    key={trip.id}
                    type="button"
                    onClick={() => onViewTrip(trip.id)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="flex items-center gap-3 w-full px-4 sm:px-6 py-3 transition-colors hover:bg-muted/50 active:bg-muted/60 text-left"
                  >
                    <div className={cn("flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg", iconBg)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {isGrocery ? "Grocery Trip" : "Shopping Trip"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {trip.items.length} item{trip.items.length !== 1 ? "s" : ""} &middot; {trip.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-destructive whitespace-nowrap">
                        {formatCurrency(-total)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
