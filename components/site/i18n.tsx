"use client"

import { usePathname } from "next/navigation"
import { stripLocale } from "@/lib/i18n/locales"

/**
 * The address as the visitor sees it. A page rendered at build time lives at `/pt/notes` inside
 * the app while the browser shows `/notes`; this is the same on both sides, which `usePathname`
 * alone is not.
 *
 * The words themselves come from next-intl: `useTranslations("namespace")` in any component,
 * server or client, reading messages/en.json and messages/pt.json.
 */
export const useSitePath = (): string => stripLocale(usePathname())
