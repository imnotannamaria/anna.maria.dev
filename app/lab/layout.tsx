import type { Metadata } from "next"
import { notFound } from "next/navigation"

// Kept out of every index. The sitemap excludes /lab too (next-sitemap.config.js).
export const metadata: Metadata = {
  title: "lab",
  robots: { index: false, follow: false },
}

/**
 * /lab holds the prototype of the new UI, before it is migrated into real routes.
 * It only exists in development: anywhere else the whole route is a 404.
 */
export default function LabLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== "development") notFound()
  return children
}
