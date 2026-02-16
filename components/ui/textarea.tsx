"use client"

import * as React from "react"
import { Textarea as HeroUITextarea } from "@heroui/react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<typeof HeroUITextarea>
>(({ className, ...props }, ref) => (
  <HeroUITextarea
    ref={ref}
    variant="bordered"
    radius="md"
    minRows={2}
    classNames={{
      input: "text-base md:text-sm",
      inputWrapper: "border-input bg-background data-[hover=true]:bg-background group-data-[focus=true]:border-ring",
    }}
    className={cn(className)}
    {...props}
  />
))
Textarea.displayName = "Textarea"

export { Textarea }
