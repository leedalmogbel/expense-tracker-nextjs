"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useExpense } from "@/contexts/expense-context"
import { getShoppingTrips } from "@/lib/storage"
import { ArrowLeft, ShoppingCart, ShoppingBag, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { ShoppingTrip } from "@/lib/types"

interface ShoppingTripDetailProps {
  tripId: string
  onBack: () => void
}

export function ShoppingTripDetail({ tripId, onBack }: ShoppingTripDetailProps) {
  const { formatCurrency } = useExpense()
  const [trip, setTrip] = useState<ShoppingTrip | null>(null)

  useEffect(() => {
    const trips = getShoppingTrips()
    const found = trips.find((t) => t.id === tripId)
    if (found) setTrip(found)
  }, [tripId])

  if (!trip) return null

  const total = trip.items.reduce((sum, item) => sum + item.price, 0)
  const isGrocery = trip.type === "grocery"
  const Icon = isGrocery ? ShoppingCart : ShoppingBag
  const label = isGrocery ? "Grocery Trip" : "Shopping Trip"
  const category = isGrocery ? "Groceries" : "Shopping"

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 rounded-lg"
          onClick={onBack}
          aria-label="Back to trips"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Icon className="h-5 w-5 text-primary shrink-0" />
          <h2 className="font-heading text-lg font-semibold text-foreground truncate">{label}</h2>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </span>
      </div>

      {/* Summary */}
      <Card className="border-border">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total</p>
              <p className="mt-1 text-xl font-bold font-heading text-foreground tabular-nums">{formatCurrency(total)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Items</p>
              <p className="mt-1 text-xl font-bold font-heading text-foreground">{trip.items.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Category</p>
              <p className="mt-1 text-sm font-medium text-foreground">{category}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Date</p>
              <p className="mt-1 text-sm font-medium text-foreground">{trip.date}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Item list */}
      <Card className="border-border">
        <CardHeader className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-border">
          <CardTitle className="font-heading text-base font-semibold text-foreground">
            Items ({trip.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <div className="divide-y divide-border">
            {trip.items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className="flex items-center justify-between px-4 sm:px-6 py-3"
              >
                <p className="text-sm font-medium text-foreground truncate min-w-0 flex-1">{item.name}</p>
                <span className="text-sm font-semibold text-foreground tabular-nums ml-4 whitespace-nowrap">
                  {formatCurrency(item.price)}
                </span>
              </motion.div>
            ))}
          </div>
          {/* Total row */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-border bg-muted/30">
            <p className="text-sm font-semibold text-foreground">Total</p>
            <span className="text-sm font-bold text-foreground tabular-nums">{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
