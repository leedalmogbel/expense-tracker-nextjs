"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectItem } from "@/components/ui/select"
import { addBankAccount, updateBankAccount } from "@/lib/storage"
import type { BankAccount } from "@/lib/types"
import { toast } from "sonner"

const inputClass = "h-11 rounded-lg border border-input bg-background text-sm"

const ACCOUNT_TYPES = [
  { key: "bank", label: "Bank" },
  { key: "ewallet", label: "E-Wallet" },
  { key: "cash", label: "Cash" },
]

interface AddAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingAccount?: BankAccount | null
  onSaved?: () => void
}

export function AddAccountModal({
  open,
  onOpenChange,
  editingAccount,
  onSaved,
}: AddAccountModalProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<"bank" | "ewallet" | "cash">("bank")
  const [initialBalance, setInitialBalance] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!editingAccount

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name)
      setType(editingAccount.type)
      setInitialBalance(String(editingAccount.initialBalance))
    } else {
      setName("")
      setType("bank")
      setInitialBalance("")
    }
  }, [editingAccount, open])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    const balance = parseFloat(initialBalance) || 0

    setIsSubmitting(true)

    if (isEditing && editingAccount) {
      updateBankAccount(editingAccount.id, {
        name: trimmedName,
        type,
        initialBalance: balance,
      })
      toast.success("Account updated", { description: trimmedName })
    } else {
      addBankAccount({
        name: trimmedName,
        type,
        initialBalance: balance,
        isActive: true,
      })
      toast.success("Account added", { description: trimmedName })
    }

    setIsSubmitting(false)
    onSaved?.()
    onOpenChange(false)
    setName("")
    setType("bank")
    setInitialBalance("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
            {isEditing ? "Edit account" : "Add account"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {isEditing
              ? "Update your account details."
              : "Add a bank account, e-wallet, or cash account to track balances."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="add-account-form" className="px-6 pb-6">
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="account-name" className="text-sm font-medium text-foreground">
                Account name
              </Label>
              <Input
                id="account-name"
                placeholder="e.g. BDO Savings, GCash, Wallet"
                required
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Type</Label>
              <Select
                placeholder="Select type"
                classNames={{ trigger: inputClass }}
                selectedKeys={[type]}
                onSelectionChange={(keys) => {
                  const v = Array.from(keys)[0]
                  if (typeof v === "string") setType(v as "bank" | "ewallet" | "cash")
                }}
              >
                {ACCOUNT_TYPES.map((t) => (
                  <SelectItem key={t.key}>{t.label}</SelectItem>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-balance" className="text-sm font-medium text-foreground">
                Initial balance
              </Label>
              <Input
                id="account-balance"
                type="number"
                placeholder="0.00"
                step="0.01"
                className={inputClass}
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-6 mt-6 border-t border-border px-6 pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-w-[88px] h-10 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-account-form"
              disabled={isSubmitting}
              className="min-w-[120px] h-10 rounded-lg"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : isEditing ? (
                "Save changes"
              ) : (
                "Add account"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
