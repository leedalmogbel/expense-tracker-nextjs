"use client"

import { motion } from "framer-motion"
import { IncomeSourcesSection } from "@/components/dashboard/income-sources-section"
import { IncomeSummaryCards } from "@/components/dashboard/income-summary-cards"
import { IncomeTrendChart } from "@/components/dashboard/income-trend-chart"
import { IncomeBreakdown } from "@/components/dashboard/income-breakdown"
import { staggerContainer, fadeUpItem } from "@/lib/utils"

export default function IncomePage() {
  return (
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
      <p className="text-sm text-muted-foreground">
        Track your income sources and trends over time.
      </p>

      <motion.div
        className="mt-8 space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUpItem}>
          <IncomeSourcesSection />
        </motion.div>
        <motion.div variants={fadeUpItem}>
          <IncomeSummaryCards />
        </motion.div>
        <motion.div variants={fadeUpItem}>
          <IncomeTrendChart />
        </motion.div>
        <motion.div variants={fadeUpItem}>
          <IncomeBreakdown />
        </motion.div>
      </motion.div>
    </div>
  )
}
