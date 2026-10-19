"use client"

import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { localePath } from "@/lib/i18n/locales"
import { hrefOf, type ScreenId } from "./pages"

/**
 * For a piece that goes to another screen from code: the terminal's `open`, a chat button. It
 * stays in the language of the page.
 */
export function useNavigate(): (screen: ScreenId) => void {
  const router = useRouter()
  const locale = useLocale()
  return useCallback(
    (screen: ScreenId) => router.push(localePath(locale, hrefOf(screen))),
    [router, locale],
  )
}
