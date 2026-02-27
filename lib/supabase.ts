"use client"

import { createClient as createBrowserClient } from "./supabase/client"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/** Client-side Supabase client (used for auth + data). Same instance so session is shared. */
export const supabase =
  typeof window !== "undefined" && url && anonKey ? createBrowserClient() : null

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey)
}
