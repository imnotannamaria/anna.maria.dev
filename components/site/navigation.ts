"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { hrefOf, type ScreenId } from "./pages"

/** For a piece that goes to another screen from code: the terminal's `open`, a chat button. */
export function useNavigate(): (screen: ScreenId) => void {
  const router = useRouter()
  return useCallback((screen: ScreenId) => router.push(hrefOf(screen)), [router])
}
