"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface CreatePromoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function CreatePromoModal({
  open,
  onOpenChange,
  onCreated,
}: CreatePromoModalProps) {
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [maxUses, setMaxUses] = useState("")
  const [durationDays, setDurationDays] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const resetForm = () => {
    setCode("")
    setDescription("")
    setMaxUses("")
    setDurationDays("")
    setExpiresAt("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim()) {
      toast.error("Promo code is required")
      return
    }

    try {
      setSubmitting(true)

      const body: Record<string, unknown> = {
        code: code.trim().toUpperCase(),
        description: description.trim() || null,
        max_uses: maxUses ? parseInt(maxUses, 10) : null,
        duration_days: durationDays ? parseInt(durationDays, 10) : null,
        expires_at: expiresAt || null,
      }

      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to create promo code")
      }

      toast.success("Promo code created successfully")
      resetForm()
      onCreated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create promo code")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Promo Code</DialogTitle>
          <DialogDescription>
            Create a new promotional code for users.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="promo-code">Code</Label>
            <Input
              id="promo-code"
              placeholder="e.g. WELCOME50"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono uppercase"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="promo-description">Description</Label>
            <Input
              id="promo-description"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Max Uses */}
          <div className="space-y-2">
            <Label htmlFor="promo-max-uses">Max Uses</Label>
            <Input
              id="promo-max-uses"
              type="number"
              placeholder="Unlimited if empty"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              min={1}
            />
          </div>

          {/* Duration Days */}
          <div className="space-y-2">
            <Label htmlFor="promo-duration">Duration (days)</Label>
            <Input
              id="promo-duration"
              type="number"
              placeholder="Lifetime if empty"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              min={1}
            />
          </div>

          {/* Expires At */}
          <div className="space-y-2">
            <Label htmlFor="promo-expires">Expires At</Label>
            <Input
              id="promo-expires"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
