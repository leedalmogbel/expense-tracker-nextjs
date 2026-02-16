"use client"

import {
  ShoppingCart,
  Utensils,
  Home,
  Car,
  Music,
  Wifi,
  Heart,
  BookOpen,
  CircleDot,
  LucideIcon,
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  "shopping-cart": ShoppingCart,
  utensils: Utensils,
  home: Home,
  car: Car,
  music: Music,
  "shopping-bag": ShoppingCart, // fallback
  wifi: Wifi,
  heart: Heart,
  "book-open": BookOpen,
  "circle-dot": CircleDot,
}

export function getCategoryIconComponent(iconName: string): LucideIcon {
  return iconMap[iconName] ?? CircleDot
}
