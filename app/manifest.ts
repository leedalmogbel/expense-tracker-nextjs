import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dosh Mate - Smart Expense Tracking",
    short_name: "Dosh Mate",
    description:
      "Track, analyze, and optimize your spending with Dosh Mate.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0a0e1a",
    theme_color: "#0a0e1a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
