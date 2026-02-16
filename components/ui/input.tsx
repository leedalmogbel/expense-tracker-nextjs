"use client"

import * as React from "react"
import { Input as HeroUIInput } from "@heroui/react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof HeroUIInput> & { type?: string }
>(({ className, type, ...props }, ref) => (
  <HeroUIInput
    ref={ref}
    type={type}
    variant="bordered"
    radius="md"
    classNames={{
      input: "text-base md:text-sm",
      inputWrapper: "border-input bg-background data-[hover=true]:bg-background group-data-[focus=true]:border-ring",
    }}
    className={cn(className)}
    {...props}
  />
))
Input.displayName = "Input"

export { Input }
