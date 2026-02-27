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
  Briefcase,
  Laptop,
  Building2,
  TrendingUp,
  Gift,
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
  briefcase: Briefcase,
  laptop: Laptop,
  building: Building2,
  "trending-up": TrendingUp,
  gift: Gift,
}

export function getCategoryIconComponent(iconName: string): LucideIcon {
  return iconMap[iconName] ?? CircleDot
}
