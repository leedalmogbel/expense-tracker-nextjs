"use client"

import * as React from "react"
import { Progress as HeroUIProgress } from "@heroui/react"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof HeroUIProgress>
>(({ className, value, ...props }, ref) => (
  <HeroUIProgress ref={ref} value={value} className={cn(className)} {...props} />
))
Progress.displayName = "Progress"

export { Progress }
