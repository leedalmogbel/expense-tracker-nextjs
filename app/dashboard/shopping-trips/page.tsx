"use client"

import { motion } from "framer-motion"
import { ShoppingTripsView } from "@/components/dashboard/shopping-trips-view"
import { staggerContainer, fadeUpItem } from "@/lib/utils"

export default function ShoppingTripsPage() {
  return (
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">

      <motion.div
        className="mt-8 space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUpItem}>
          <ShoppingTripsView />
        </motion.div>
      </motion.div>
    </div>
  )
}
