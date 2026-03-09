"use client"

import { useCallback, useEffect, useState } from "react"
import { format } from "date-fns"
import { Loader2, Plus, ToggleLeft, ToggleRight, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CreatePromoModal } from "@/components/admin/create-promo-modal"

interface PromoCode {
  id: string
  code: string
  description: string | null
  max_uses: number | null
  current_uses: number
  duration_days: number | null
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export function PromoCodeTable() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchPromoCodes = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/promo-codes")
      if (!res.ok) throw new Error("Failed to fetch promo codes")
      const data = await res.json()
      setPromoCodes(data.promo_codes ?? data)
    } catch (err) {
      toast.error("Failed to load promo codes")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPromoCodes()
  }, [fetchPromoCodes])

  const handleToggleActive = async (promo: PromoCode) => {
    try {
      setActionLoading(`toggle-${promo.id}`)
      const res = await fetch(`/api/admin/promo-codes/${promo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !promo.is_active }),
      })
      if (!res.ok) throw new Error("Failed to update promo code")

      setPromoCodes((prev) =>
        prev.map((p) =>
          p.id === promo.id ? { ...p, is_active: !p.is_active } : p
        )
      )
      toast.success(
        promo.is_active ? "Promo code deactivated" : "Promo code activated"
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (promoId: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return

    try {
      setActionLoading(`delete-${promoId}`)
      const res = await fetch(`/api/admin/promo-codes/${promoId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete promo code")

      setPromoCodes((prev) => prev.filter((p) => p.id !== promoId))
      toast.success("Promo code deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed")
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreated = () => {
    setModalOpen(false)
    fetchPromoCodes()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {promoCodes.length} promo code{promoCodes.length !== 1 ? "s" : ""}
        </span>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Promo Code
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : promoCodes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  No promo codes found.
                </TableCell>
              </TableRow>
            ) : (
              promoCodes.map((promo) => {
                const isExpired =
                  promo.expires_at && new Date(promo.expires_at) < new Date()
                const isMaxedOut =
                  promo.max_uses !== null &&
                  promo.current_uses >= promo.max_uses

                return (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-sm font-mono font-semibold">
                        {promo.code}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {promo.description || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="font-medium">{promo.current_uses}</span>
                      <span className="text-muted-foreground">
                        /{promo.max_uses ?? "\u221E"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {promo.duration_days
                        ? `${promo.duration_days} day${promo.duration_days !== 1 ? "s" : ""}`
                        : "Lifetime"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          promo.is_active && !isExpired && !isMaxedOut
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        )}
                      >
                        {isExpired
                          ? "Expired"
                          : isMaxedOut
                            ? "Maxed Out"
                            : promo.is_active
                              ? "Active"
                              : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {promo.expires_at
                        ? format(new Date(promo.expires_at), "MMM d, yyyy")
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoading === `toggle-${promo.id}`}
                          onClick={() => handleToggleActive(promo)}
                          className="text-xs"
                        >
                          {actionLoading === `toggle-${promo.id}` ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : promo.is_active ? (
                            <ToggleRight className="mr-1 h-3 w-3" />
                          ) : (
                            <ToggleLeft className="mr-1 h-3 w-3" />
                          )}
                          {promo.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoading === `delete-${promo.id}`}
                          onClick={() => handleDelete(promo.id)}
                          className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                        >
                          {actionLoading === `delete-${promo.id}` ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="mr-1 h-3 w-3" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <CreatePromoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreated={handleCreated}
      />
    </div>
  )
}
