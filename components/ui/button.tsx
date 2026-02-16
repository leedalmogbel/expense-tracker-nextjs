"use client"

import * as React from "react"
import { Button as HeroUIButton } from "@heroui/react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva("", {
  variants: {
    variant: {
      default: "",
      destructive: "",
      outline: "",
      secondary: "",
      ghost: "",
      link: "",
    },
    size: {
      default: "",
      sm: "",
      lg: "",
      icon: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface ButtonProps
  extends Omit<React.ComponentProps<typeof HeroUIButton>, "color" | "variant" | "size">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const variantMap = {
  default: { color: "primary" as const, variant: "solid" as const },
  destructive: { color: "danger" as const, variant: "solid" as const },
  outline: { color: "default" as const, variant: "bordered" as const },
  secondary: { color: "default" as const, variant: "flat" as const },
  ghost: { color: "default" as const, variant: "light" as const },
  link: { color: "primary" as const, variant: "light" as const },
}

const sizeMap = {
  default: "md" as const,
  sm: "sm" as const,
  lg: "lg" as const,
  icon: "md" as const,
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const heroProps = {
      ...variantMap[variant],
      size: sizeMap[size],
      radius: "md" as const,
      className: cn(buttonVariants({ variant, size }), className),
    }

    if (asChild && React.isValidElement(children) && React.Children.count(children) === 1) {
      const child = children as React.ReactElement<Record<string, unknown>>
      return React.cloneElement(child, {
        ...props,
        ...child.props,
        className: cn(heroProps.className, child.props?.className),
        ref: ref ?? (child as React.RefAttributes<unknown>).ref,
      })
    }

    return (
      <HeroUIButton ref={ref} {...heroProps} {...props}>
        {children}
      </HeroUIButton>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
