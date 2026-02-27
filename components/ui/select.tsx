"use client"

import * as React from "react"
import { Select as HeroUISelect } from "@heroui/react"

import { cn } from "@/lib/utils"

/**
 * Select – full-width, properly styled trigger with rounded-lg borders.
 * @see https://www.heroui.com/docs/components/select
 */
const selectTriggerClasses =
  "h-11 min-h-11 w-full rounded-lg border border-input bg-background px-3 " +
  "flex flex-row-reverse items-center gap-2 " +
  "text-sm font-medium text-foreground " +
  "data-[hover=true]:bg-background data-[hover=true]:border-muted-foreground/40 " +
  "group-data-[focus=true]:border-primary group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-primary/20 " +
  "data-[open=true]:border-primary data-[open=true]:ring-2 data-[open=true]:ring-primary/20 " +
  "transition-all duration-150"

/** Value text: left-aligned, proper foreground color */
const selectValueClasses = "text-sm text-foreground text-left truncate"

const defaultClassNames = {
  base: "w-full",
  trigger: selectTriggerClasses,
  value: selectValueClasses,
  innerWrapper: "flex-1 min-w-0 overflow-hidden text-left",
  selectorIcon: "shrink-0 text-muted-foreground pointer-events-none",
  listboxWrapper: "p-0",
  listbox: cn(
    "max-h-[300px] overflow-auto rounded-lg border border-border bg-popover p-1 shadow-lg"
  ),
  popoverContent: cn(
    "rounded-lg border border-border bg-popover shadow-lg p-0"
  ),
}

export type SelectProps = React.ComponentProps<typeof HeroUISelect>

const Select = React.forwardRef<React.ElementRef<typeof HeroUISelect>, SelectProps>(
  function Select(
    {
      classNames,
      variant = "bordered",
      radius = "lg",
      size = "md",
      ...props
    },
    ref
  ) {
    const mergedClassNames = {
      ...defaultClassNames,
      ...classNames,
      trigger: cn(selectTriggerClasses, classNames?.trigger),
      value: cn(selectValueClasses, classNames?.value),
      listbox: cn(defaultClassNames.listbox, classNames?.listbox),
      popoverContent: cn(defaultClassNames.popoverContent, classNames?.popoverContent),
    }
    return (
      <HeroUISelect
        ref={ref}
        variant={variant}
        radius={radius}
        size={size}
        classNames={mergedClassNames}
        {...props}
      />
    )
  }
)
Select.displayName = "Select"

export { Select }
/** Re-export so Select only receives HeroUI SelectItem children (required by collection API). */
export { SelectItem } from "@heroui/react"
