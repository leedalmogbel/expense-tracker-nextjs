"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ShoppingTripsView } from "@/components/dashboard/shopping-trips-view"
import { ProjectsView } from "@/components/dashboard/projects-view"
import { staggerContainer, fadeUpItem } from "@/lib/utils"
import { ShoppingCart, FolderKanban } from "lucide-react"
import { cn } from "@/lib/utils"
import { PremiumGate } from "@/components/auth/premium-gate"

type Tab = "trips" | "projects"

export default function ShoppingTripsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("trips")

  return (
    <PremiumGate feature="shopping_trips">
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
      {/* Tab toggle */}
      <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("trips")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
            activeTab === "trips"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ShoppingCart className="h-4 w-4" />
          Trips
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
            activeTab === "projects"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FolderKanban className="h-4 w-4" />
          Projects
        </button>
      </div>

      <motion.div
        className="mt-8 space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUpItem}>
          {activeTab === "trips" ? <ShoppingTripsView /> : <ProjectsView />}
        </motion.div>
      </motion.div>
    </div>
    </PremiumGate>
  )
}
