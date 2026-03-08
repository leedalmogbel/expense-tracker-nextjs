"use client"

import { useState, useEffect, useCallback } from "react"
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
import {
  getIncomeSources,
  addIncomeSource,
  updateIncomeSource,
  deleteIncomeSource,
} from "@/lib/storage"
import { INCOME_CATEGORIES } from "@/lib/constants"
import { getOrdinalSuffix } from "@/lib/expense-utils"
import { toast } from "sonner"
import { Pencil, Trash2, Plus } from "lucide-react"
import type { IncomeSource } from "@/lib/types"

const inputClass = "h-11 rounded-lg border border-input bg-background text-sm"

const PAY_DAY_OPTIONS = [
  ...Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1),
    label: getOrdinalSuffix(i + 1),
  })),
  { value: "EOM", label: "End of Month" },
]

interface AddIncomeSourceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

export function AddIncomeSourceModal({
  open,
  onOpenChange,
  onSaved,
}: AddIncomeSourceModalProps) {
  const [sources, setSources] = useState<IncomeSource[]>([])
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [expectedAmount, setExpectedAmount] = useState("")
  const [payDay, setPayDay] = useState<string>("15")
  const [category, setCategory] = useState<string>("Salary")
  const [isActive, setIsActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadSources = useCallback(() => {
    setSources(getIncomeSources())
  }, [])

  useEffect(() => {
    if (open) {
      loadSources()
      resetForm()
    }
  }, [open, loadSources])

  const resetForm = () => {
    setEditingSource(null)
    setShowForm(false)
    setName("")
    setExpectedAmount("")
    setPayDay("15")
    setCategory("Salary")
    setIsActive(true)
  }

  const startEdit = (source: IncomeSource) => {
    setEditingSource(source)
    setName(source.name)
    setExpectedAmount(String(source.expectedAmount))
    setPayDay(String(source.payDay))
    setCategory(source.category)
    setIsActive(source.isActive)
    setShowForm(true)
  }

  const startAdd = () => {
    resetForm()
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim() || !expectedAmount) return

    setIsSubmitting(true)

    const parsedAmount = parseFloat(expectedAmount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount")
      setIsSubmitting(false)
      return
    }

    const parsedPayDay: number | "EOM" =
      payDay === "EOM" ? "EOM" : Number(payDay)

    if (editingSource) {
      updateIncomeSource(editingSource.id, {
        name: name.trim(),
        expectedAmount: parsedAmount,
        payDay: parsedPayDay,
        category,
        isActive,
      })
      toast.success("Income source updated", { description: name.trim() })
    } else {
      addIncomeSource({
        name: name.trim(),
        expectedAmount: parsedAmount,
        payDay: parsedPayDay,
        category,
        isActive,
      })
      toast.success("Income source added", { description: name.trim() })
    }

    setIsSubmitting(false)
    loadSources()
    resetForm()
    onSaved?.()
  }

  const handleDelete = (id: string, sourceName: string) => {
    deleteIncomeSource(id)
    toast.success("Income source removed", { description: sourceName })
    loadSources()
    onSaved?.()
  }

  const isEditing = !!editingSource

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Manage Income Sources
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Define your expected income sources, amounts, and pay dates.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Existing sources list */}
          {sources.length > 0 && !showForm && (
            <div className="space-y-2 pt-2">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all duration-200 hover:bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {source.name}
                      </p>
                      {!source.isActive && (
                        <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {source.category} &middot;{" "}
                      {source.payDay === "EOM"
                        ? "End of Month"
                        : getOrdinalSuffix(source.payDay as number)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEdit(source)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(source.id, source.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {sources.length === 0 && !showForm && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No income sources yet. Add your first one to track expected
                income.
              </p>
            </div>
          )}

          {/* Add / Edit form */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              id="income-source-form"
              className="space-y-5 pt-2"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="source-name"
                  className="text-sm font-medium text-foreground"
                >
                  Source name
                </Label>
                <Input
                  id="source-name"
                  type="text"
                  placeholder="e.g. Acme Corp, Freelance Client"
                  className={inputClass}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="expected-amount"
                  className="text-sm font-medium text-foreground"
                >
                  Expected amount
                </Label>
                <Input
                  id="expected-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 50000"
                  className={inputClass}
                  required
                  value={expectedAmount}
                  onChange={(e) => setExpectedAmount(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Pay day
                  </Label>
                  <Select
                    placeholder="Select day"
                    classNames={{ trigger: inputClass }}
                    selectedKeys={[payDay]}
                    onSelectionChange={(keys) => {
                      const v = Array.from(keys)[0]
                      if (v) setPayDay(String(v))
                    }}
                  >
                    {PAY_DAY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Category
                  </Label>
                  <Select
                    placeholder="Select category"
                    classNames={{ trigger: inputClass }}
                    selectedKeys={[category]}
                    onSelectionChange={(keys) => {
                      const v = Array.from(keys)[0]
                      if (v) setCategory(String(v))
                    }}
                  >
                    {INCOME_CATEGORIES.map((cat) => (
                      <SelectItem key={cat}>{cat}</SelectItem>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Active</p>
                  <p className="text-xs text-muted-foreground">
                    Inactive sources won&apos;t appear in expected totals
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => setIsActive(!isActive)}
                  className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${isActive ? "bg-primary" : "bg-input"}`}
                >
                  <span
                    className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${isActive ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>
            </form>
          )}

          {/* Footer actions */}
          {showForm ? (
            <DialogFooter className="gap-2 pt-6 mt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="min-w-[88px] h-10 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="income-source-form"
                disabled={isSubmitting}
                className="min-w-[120px] h-10 rounded-lg"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : isEditing ? (
                  "Save changes"
                ) : (
                  "Add source"
                )}
              </Button>
            </DialogFooter>
          ) : (
            <div className="pt-4 mt-4 border-t border-border flex justify-end">
              <Button
                type="button"
                onClick={startAdd}
                className="h-10 rounded-lg gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add source
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
