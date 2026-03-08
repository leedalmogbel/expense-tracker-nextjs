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
import { addProject } from "@/lib/storage"
import { toast } from "sonner"

const inputClass = "h-11 rounded-lg border border-input bg-background text-sm"

interface AddProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

export function AddProjectModal({ open, onOpenChange, onSaved }: AddProjectModalProps) {
  const [name, setName] = useState("")
  const [budget, setBudget] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName("")
      setBudget("")
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)

    const parsedBudget = parseFloat(budget)

    addProject({
      name: name.trim(),
      budget: parsedBudget > 0 ? parsedBudget : undefined,
      items: [],
      status: "active",
    })

    toast.success("Project created", { description: name.trim() })
    setIsSubmitting(false)
    onSaved?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
            New Project
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Create a project to group and track related expenses.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="add-project-form" className="px-6 pb-6">
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-sm font-medium text-foreground">
                Project name
              </Label>
              <Input
                id="project-name"
                type="text"
                placeholder="e.g. Kitchen Renovation, Home Office Setup"
                className={inputClass}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-budget" className="text-sm font-medium text-foreground">
                Budget <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="project-budget"
                type="number"
                step="0.01"
                min="0"
                placeholder="Leave blank for no budget limit"
                className={inputClass}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
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
              form="add-project-form"
              disabled={isSubmitting || !name.trim()}
              className="min-w-[120px] h-10 rounded-lg"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
