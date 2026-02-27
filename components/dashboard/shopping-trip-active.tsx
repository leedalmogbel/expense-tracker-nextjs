"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useExpense } from "@/contexts/expense-context"
import { getShoppingTrips, updateShoppingTrip, deleteShoppingTrip } from "@/lib/storage"
import { ArrowLeft, ShoppingCart, ShoppingBag, Plus, Trash2, Check, Square, CheckSquare } from "lucide-react"
import { Select, SelectItem } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { syncSingleTransaction } from "@/lib/supabase-api"
import type { ShoppingTrip, ShoppingTripItem } from "@/lib/types"

interface ShoppingTripActiveProps {
  tripId: string
  onFinish: (tripId: string) => void
  onCancel: () => void
}

export function ShoppingTripActive({ tripId, onFinish, onCancel }: ShoppingTripActiveProps) {
  const { addTransaction, paymentMethods, formatCurrency } = useExpense()
  const { user, isSupabaseConfigured } = useAuth()
  const [trip, setTrip] = useState<ShoppingTrip | null>(null)
  const [items, setItems] = useState<ShoppingTripItem[]>([])
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [itemName, setItemName] = useState("")
  const [itemPrice, setItemPrice] = useState("")
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0] ?? "Cash")
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Load trip
  useEffect(() => {
    const trips = getShoppingTrips()
    const found = trips.find((t) => t.id === tripId)
    if (found) {
      setTrip(found)
      setItems(found.items)
    }
  }, [tripId])

  // Persist items to localStorage on change
  const persistItems = useCallback(
    (newItems: ShoppingTripItem[]) => {
      setItems(newItems)
      updateShoppingTrip(tripId, { items: newItems })
    },
    [tripId]
  )

  const total = items.reduce((sum, item) => sum + item.price, 0)

  const handleAddItem = () => {
    const name = itemName.trim()
    const price = parseFloat(itemPrice)
    if (!name || isNaN(price) || price <= 0) return

    const newItem: ShoppingTripItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      price,
    }
    persistItems([...items, newItem])
    setItemName("")
    setItemPrice("")
    nameInputRef.current?.focus()
  }

  const handleRemoveItem = (itemId: string) => {
    persistItems(items.filter((i) => i.id !== itemId))
    setCheckedIds((prev) => {
      const next = new Set(prev)
      next.delete(itemId)
      return next
    })
  }

  const toggleCheck = (itemId: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  const handleFinishTrip = () => {
    if (items.length === 0 || !trip) return

    const isGrocery = trip.type === "grocery"
    const category = isGrocery ? "Groceries" : "Shopping"
    const icon = isGrocery ? "shopping-cart" : "shopping-bag"
    const label = isGrocery ? "Grocery" : "Shopping"

    const tx = addTransaction({
      description: `${label} Trip (${items.length} item${items.length !== 1 ? "s" : ""})`,
      category,
      amount: -Math.abs(total),
      icon,
      date: format(new Date(), "yyyy-MM-dd"),
      isPositive: false,
      paymentMethod,
    })

    updateShoppingTrip(tripId, {
      status: "completed",
      completedAt: new Date().toISOString(),
      transactionId: tx.id,
      items,
    })

    toast.success("Trip completed! Expense added.")
    if (user && isSupabaseConfigured) {
      syncSingleTransaction(user.id, tx).catch(() => {})
    }
    onFinish(tripId)
  }

  const handleCancelTrip = () => {
    if (items.length > 0) {
      const confirmed = window.confirm("Cancel this trip? All items will be lost.")
      if (!confirmed) return
    }
    deleteShoppingTrip(tripId)
    toast.success("Trip cancelled")
    onCancel()
  }

  if (!trip) return null

  const isGrocery = trip.type === "grocery"
  const Icon = isGrocery ? ShoppingCart : ShoppingBag
  const label = isGrocery ? "Grocery Trip" : "Shopping Trip"

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 rounded-lg"
          onClick={handleCancelTrip}
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Icon className="h-5 w-5 text-primary shrink-0" />
          <h2 className="font-heading text-lg font-semibold text-foreground truncate">{label}</h2>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-foreground tabular-nums">{formatCurrency(total)}</p>
          <p className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Quick-add form */}
      <Card className="border-border">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              ref={nameInputRef}
              type="text"
              placeholder="Item name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddItem()
                }
              }}
              className="h-10 flex-1 min-w-[140px] rounded-lg border border-input bg-background text-sm"
              autoFocus
            />
            <Input
              type="number"
              placeholder="Price"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddItem()
                }
              }}
              className="h-10 w-[100px] rounded-lg border border-input bg-background text-sm"
              min="0"
              step="0.01"
            />
            <Button
              onClick={handleAddItem}
              disabled={!itemName.trim() || !itemPrice || parseFloat(itemPrice) <= 0}
              className="h-10 gap-1.5 rounded-lg px-4"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Item list */}
      <Card className="border-border">
        <CardContent className="px-0 py-0">
          {items.length === 0 ? (
            <div className="px-4 py-10 sm:px-6 sm:py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                <Icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No items yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add items above to start your trip</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <AnimatePresence initial={false}>
                {items.map((item) => {
                  const isChecked = checkedIds.has(item.id)
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3"
                    >
                      <button
                        type="button"
                        onClick={() => toggleCheck(item.id)}
                        className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                        aria-label={isChecked ? "Uncheck" : "Check"}
                      >
                        {isChecked ? (
                          <CheckSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          "text-sm font-medium text-foreground truncate transition-all",
                          isChecked && "line-through text-muted-foreground"
                        )}>
                          {item.name}
                        </p>
                      </div>
                      <span className={cn(
                        "text-sm font-semibold tabular-nums whitespace-nowrap",
                        isChecked ? "text-muted-foreground line-through" : "text-foreground"
                      )}>
                        {formatCurrency(item.price)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => handleRemoveItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="border-border sticky bottom-4">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total</p>
              <p className="text-2xl font-bold font-heading text-foreground tabular-nums">{formatCurrency(total)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Payment method</p>
              <Select
                aria-label="Payment method"
                placeholder="Select"
                classNames={{ base: "w-auto min-w-[140px]", trigger: "h-9 min-h-9" }}
                selectedKeys={paymentMethod ? [paymentMethod] : []}
                onSelectionChange={(keys) => {
                  const v = Array.from(keys)[0]
                  if (typeof v === "string") setPaymentMethod(v)
                }}
              >
                {paymentMethods.map((m) => (
                  <SelectItem key={m}>{m}</SelectItem>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-lg"
              onClick={handleCancelTrip}
            >
              Cancel Trip
            </Button>
            <Button
              className="flex-1 h-11 rounded-lg gap-1.5"
              onClick={handleFinishTrip}
              disabled={items.length === 0}
            >
              <Check className="h-4 w-4" />
              Finish Trip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
