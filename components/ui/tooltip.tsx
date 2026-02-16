"use client"

import * as React from "react"
import { Tooltip as HeroUITooltip } from "@heroui/react"

import { cn } from "@/lib/utils"

const TooltipContext = React.createContext<{ delayDuration?: number }>({})

function TooltipProvider({
  delayDuration = 0,
  children,
}: {
  delayDuration?: number
  children: React.ReactNode
}) {
  return (
    <TooltipContext.Provider value={{ delayDuration }}>
      {children}
    </TooltipContext.Provider>
  )
}

// HeroUI Tooltip uses content + children (trigger); no TooltipTrigger/TooltipContent exports.
// We implement compatible Tooltip, TooltipTrigger, TooltipContent that map to HeroUI's API.
function Tooltip({ children }: { children: React.ReactNode }) {
  const { delayDuration = 0 } = React.useContext(TooltipContext)
  let trigger: React.ReactNode = null
  let content: React.ReactNode = null

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return
    if (child.type === TooltipTrigger) {
      trigger = (child.props as { asChild?: boolean; children?: React.ReactNode }).asChild
        ? (child.props as { children?: React.ReactNode }).children
        : child
    }
    if (child.type === TooltipContent) {
      content = (child.props as { children?: React.ReactNode }).children
    }
  })

  if (!trigger || content === null) return <>{children}</>

  return (
    <HeroUITooltip content={content} delay={delayDuration} closeDelay={0}>
      {trigger}
    </HeroUITooltip>
  )
}

function TooltipTrigger({
  asChild,
  children,
  ...props
}: {
  asChild?: boolean
  children?: React.ReactNode
  [key: string]: unknown
}) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, props)
  }
  return <span {...props}>{children}</span>
}

function TooltipContent({
  side,
  className,
  children,
  ...props
}: {
  side?: "top" | "right" | "bottom" | "left"
  className?: string
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <span className={cn(className)} {...props}>
      {children}
    </span>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
