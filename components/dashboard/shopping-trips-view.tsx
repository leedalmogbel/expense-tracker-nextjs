"use client"

import { useState, useEffect, useCallback } from "react"
import { ShoppingTripsList } from "./shopping-trips-list"
import { ShoppingTripActive } from "./shopping-trip-active"
import { ShoppingTripDetail } from "./shopping-trip-detail"
import { getShoppingTrips, getActiveShoppingTrip, addShoppingTrip } from "@/lib/storage"
import type { ShoppingTrip, TripType } from "@/lib/types"
import { format } from "date-fns"
import { toast } from "sonner"

type ViewState =
  | { view: "list" }
  | { view: "active"; tripId: string }
  | { view: "detail"; tripId: string }

export function ShoppingTripsView() {
  const [viewState, setViewState] = useState<ViewState>({ view: "list" })
  const [trips, setTrips] = useState<ShoppingTrip[]>([])

  const refreshTrips = useCallback(() => {
    setTrips(getShoppingTrips())
  }, [])

  useEffect(() => {
    refreshTrips()
    // Auto-resume active trip
    const active = getActiveShoppingTrip()
    if (active) {
      setViewState({ view: "active", tripId: active.id })
    }
  }, [refreshTrips])

  const handleStartTrip = (type: TripType) => {
    const active = getActiveShoppingTrip()
    if (active) {
      toast.error("You already have an active trip. Finish or cancel it first.")
      return
    }
    const trip = addShoppingTrip({
      type,
      items: [],
      status: "active",
      date: format(new Date(), "yyyy-MM-dd"),
    })
    refreshTrips()
    setViewState({ view: "active", tripId: trip.id })
  }

  const handleFinishTrip = (tripId: string) => {
    refreshTrips()
    setViewState({ view: "detail", tripId })
  }

  const handleBackToList = () => {
    refreshTrips()
    setViewState({ view: "list" })
  }

  switch (viewState.view) {
    case "active":
      return (
        <ShoppingTripActive
          tripId={viewState.tripId}
          onFinish={handleFinishTrip}
          onCancel={handleBackToList}
        />
      )
    case "detail":
      return (
        <ShoppingTripDetail
          tripId={viewState.tripId}
          onBack={handleBackToList}
        />
      )
    default:
      return (
        <ShoppingTripsList
          trips={trips}
          onStartTrip={handleStartTrip}
          onViewTrip={(tripId) => setViewState({ view: "detail", tripId })}
        />
      )
  }
}
