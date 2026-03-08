"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useExpense } from "@/contexts/expense-context"
import { getProjects, updateProject, deleteProject } from "@/lib/storage"
import {
  FolderKanban,
  Plus,
  ArrowLeft,
  Trash2,
  Check,
  Package,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { toast } from "sonner"
import { AddProjectModal } from "./add-project-modal"
import type { Project, ProjectItem } from "@/lib/types"

type ViewState =
  | { view: "list" }
  | { view: "detail"; projectId: string }

export function ProjectsView() {
  const [viewState, setViewState] = useState<ViewState>({ view: "list" })
  const [projects, setProjects] = useState<Project[]>([])
  const [showAddModal, setShowAddModal] = useState(false)

  const refreshProjects = useCallback(() => {
    setProjects(getProjects())
  }, [])

  useEffect(() => {
    refreshProjects()
  }, [refreshProjects])

  const handleBackToList = () => {
    refreshProjects()
    setViewState({ view: "list" })
  }

  const handleProjectSaved = () => {
    refreshProjects()
  }

  switch (viewState.view) {
    case "detail":
      return (
        <ProjectDetail
          projectId={viewState.projectId}
          onBack={handleBackToList}
        />
      )
    default:
      return (
        <>
          <ProjectsList
            projects={projects}
            onViewProject={(id) => setViewState({ view: "detail", projectId: id })}
            onNewProject={() => setShowAddModal(true)}
          />
          <AddProjectModal
            open={showAddModal}
            onOpenChange={setShowAddModal}
            onSaved={handleProjectSaved}
          />
        </>
      )
  }
}

/* ------------------------------------------------------------------ */
/* Projects List                                                       */
/* ------------------------------------------------------------------ */

interface ProjectsListProps {
  projects: Project[]
  onViewProject: (id: string) => void
  onNewProject: () => void
}

function ProjectsList({ projects, onViewProject, onNewProject }: ProjectsListProps) {
  const { formatCurrency } = useExpense()

  const activeProjects = projects.filter((p) => p.status === "active")
  const completedProjects = projects
    .filter((p) => p.status === "completed")
    .sort((a, b) => (b.completedAt ?? b.createdAt).localeCompare(a.completedAt ?? a.createdAt))

  return (
    <div className="space-y-6">
      {/* New Project button card */}
      <button
        type="button"
        onClick={onNewProject}
        className="flex w-full items-center gap-4 rounded-xl border-2 border-dashed border-border bg-card p-5 transition-all duration-300 hover:bg-muted/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/30 active:scale-[0.98] group text-left"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
          <Plus className="h-6 w-6" />
        </div>
        <div>
          <p className="font-semibold text-foreground">New Project</p>
          <p className="text-xs text-muted-foreground mt-0.5">Create a project to group expenses</p>
        </div>
      </button>

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <Card className="border-border">
          <CardHeader className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FolderKanban className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                  Active Projects
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeProjects.length} project{activeProjects.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-0">
            <div className="divide-y divide-border">
              {activeProjects.map((project, i) => {
                const spent = project.items.reduce((sum, item) => sum + item.cost, 0)
                const progressPct = project.budget && project.budget > 0
                  ? Math.min((spent / project.budget) * 100, 100)
                  : null

                return (
                  <motion.button
                    key={project.id}
                    type="button"
                    onClick={() => onViewProject(project.id)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="flex items-center gap-3 w-full px-4 sm:px-6 py-4 transition-colors hover:bg-muted/50 active:bg-muted/60 text-left"
                  >
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {project.name}
                        </p>
                        <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {project.items.length} item{project.items.length !== 1 ? "s" : ""}
                        {project.budget ? ` · ${formatCurrency(spent)} of ${formatCurrency(project.budget)}` : ` · ${formatCurrency(spent)} spent`}
                      </p>
                      {progressPct !== null && (
                        <Progress
                          value={progressPct}
                          className={cn(
                            "mt-2 h-1.5",
                            progressPct >= 100 && "[&_[data-slot=indicator]]:bg-destructive"
                          )}
                        />
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </motion.button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Projects */}
      <Card className="border-border">
        <CardHeader className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                Completed Projects
              </CardTitle>
              {completedProjects.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {completedProjects.length} project{completedProjects.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-0">
          {completedProjects.length === 0 ? (
            <div className="px-4 py-10 sm:px-6 sm:py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                <FolderKanban className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No completed projects yet</p>
              <p className="text-xs text-muted-foreground mt-1">Completed projects will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {completedProjects.map((project, i) => {
                const spent = project.items.reduce((sum, item) => sum + item.cost, 0)

                return (
                  <motion.button
                    key={project.id}
                    type="button"
                    onClick={() => onViewProject(project.id)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="flex items-center gap-3 w-full px-4 sm:px-6 py-4 transition-colors hover:bg-muted/50 active:bg-muted/60 text-left opacity-75"
                  >
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-muted-foreground">
                          {project.name}
                        </p>
                        <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          Completed
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {project.items.length} item{project.items.length !== 1 ? "s" : ""} · {formatCurrency(spent)} total
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </motion.button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty state when no projects at all */}
      {activeProjects.length === 0 && completedProjects.length === 0 && (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            No projects yet. Tap &quot;New Project&quot; above to get started.
          </p>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Project Detail                                                      */
/* ------------------------------------------------------------------ */

interface ProjectDetailProps {
  projectId: string
  onBack: () => void
}

function ProjectDetail({ projectId, onBack }: ProjectDetailProps) {
  const { formatCurrency } = useExpense()
  const [project, setProject] = useState<Project | null>(null)
  const [items, setItems] = useState<ProjectItem[]>([])
  const [itemName, setItemName] = useState("")
  const [itemCost, setItemCost] = useState("")
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Load project
  useEffect(() => {
    const projects = getProjects()
    const found = projects.find((p) => p.id === projectId)
    if (found) {
      setProject(found)
      setItems(found.items)
    }
  }, [projectId])

  // Persist items to localStorage on change
  const persistItems = useCallback(
    (newItems: ProjectItem[]) => {
      setItems(newItems)
      updateProject(projectId, { items: newItems })
    },
    [projectId]
  )

  const total = items.reduce((sum, item) => sum + item.cost, 0)
  const progressPct =
    project?.budget && project.budget > 0
      ? Math.min((total / project.budget) * 100, 100)
      : null
  const isOverBudget = project?.budget ? total > project.budget : false

  const handleAddItem = () => {
    const name = itemName.trim()
    const cost = parseFloat(itemCost)
    if (!name || isNaN(cost) || cost <= 0) return

    const newItem: ProjectItem = {
      id: `pitem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      cost,
      date: format(new Date(), "yyyy-MM-dd"),
    }
    persistItems([...items, newItem])
    setItemName("")
    setItemCost("")
    nameInputRef.current?.focus()
  }

  const handleRemoveItem = (itemId: string) => {
    persistItems(items.filter((i) => i.id !== itemId))
  }

  const handleCompleteProject = () => {
    updateProject(projectId, {
      status: "completed",
      completedAt: new Date().toISOString(),
    })
    toast.success("Project completed!")
    onBack()
  }

  const handleDeleteProject = () => {
    const confirmed = window.confirm("Delete this project? This cannot be undone.")
    if (!confirmed) return
    deleteProject(projectId)
    toast.success("Project deleted")
    onBack()
  }

  if (!project) return null

  const isCompleted = project.status === "completed"

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 rounded-lg"
          onClick={onBack}
          aria-label="Back to projects"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FolderKanban className="h-5 w-5 text-primary shrink-0" />
          <h2 className="font-heading text-lg font-semibold text-foreground truncate">
            {project.name}
          </h2>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium shrink-0",
            isCompleted
              ? "bg-muted text-muted-foreground"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          )}
        >
          {isCompleted ? (
            <>
              <Check className="h-3 w-3" />
              Completed
            </>
          ) : (
            "Active"
          )}
        </span>
      </div>

      {/* Budget progress */}
      {project.budget && project.budget > 0 && (
        <Card className="border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Budget
              </p>
              <p className={cn(
                "text-sm font-semibold tabular-nums",
                isOverBudget ? "text-destructive" : "text-foreground"
              )}>
                {formatCurrency(total)} of {formatCurrency(project.budget)}
              </p>
            </div>
            <Progress
              value={progressPct ?? 0}
              className={cn(
                "h-2",
                isOverBudget && "[&_[data-slot=indicator]]:bg-destructive"
              )}
            />
            {isOverBudget && (
              <p className="text-xs text-destructive mt-1.5">
                Over budget by {formatCurrency(total - project.budget)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick-add form (only for active projects) */}
      {!isCompleted && (
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
                placeholder="Cost"
                value={itemCost}
                onChange={(e) => setItemCost(e.target.value)}
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
                disabled={!itemName.trim() || !itemCost || parseFloat(itemCost) <= 0}
                className="h-10 gap-1.5 rounded-lg px-4"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Item list */}
      <Card className="border-border">
        <CardHeader className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-border">
          <CardTitle className="font-heading text-base font-semibold text-foreground">
            Items ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 py-0">
          {items.length === 0 ? (
            <div className="px-4 py-10 sm:px-6 sm:py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No items yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isCompleted
                  ? "This project had no items"
                  : "Add items above to start tracking expenses"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <AnimatePresence initial={false}>
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums whitespace-nowrap text-foreground">
                      {formatCurrency(item.cost)}
                    </span>
                    {!isCompleted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => handleRemoveItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Total row */}
          {items.length > 0 && (
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-border bg-muted/30">
              <p className="text-sm font-semibold text-foreground">Total</p>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {formatCurrency(total)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions for active project */}
      {!isCompleted && (
        <Card className="border-border sticky bottom-4">
          <CardContent className="p-4 sm:p-5">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-lg text-destructive hover:text-destructive"
                onClick={handleDeleteProject}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
              <Button
                className="flex-1 h-11 rounded-lg gap-1.5"
                onClick={handleCompleteProject}
              >
                <Check className="h-4 w-4" />
                Complete Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
