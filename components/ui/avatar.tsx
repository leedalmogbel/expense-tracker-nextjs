"use client"

import * as React from "react"
import { Avatar as HeroUIAvatar } from "@heroui/react"

import { cn } from "@/lib/utils"

// HeroUI Avatar doesn't export AvatarFallback; we provide our own and wire it via name/children
const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary",
      className
    )}
    {...props}
  >
    {children}
  </span>
))
AvatarFallback.displayName = "AvatarFallback"

const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<typeof HeroUIAvatar> & { children?: React.ReactNode }
>(({ children, className, ...props }, ref) => {
  // If single child is AvatarFallback, use its text as initials (HeroUI Avatar uses name prop)
  let name = props.name
  if (name === undefined && React.Children.count(children) === 1 && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ children?: React.ReactNode }>
    if (child.type === AvatarFallback && typeof child.props.children === "string") {
      name = child.props.children
    }
  }
  return <HeroUIAvatar ref={ref} name={name} className={cn(className)} {...props} />
})
Avatar.displayName = "Avatar"

export { Avatar, AvatarFallback }
