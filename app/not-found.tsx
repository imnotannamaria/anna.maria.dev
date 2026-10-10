import type { Metadata } from "next"
import { ScreenNotFound } from "@/components/site/frame/screen-state"

export const metadata: Metadata = { title: "Page not found" }

/**
 * The fallback of last resort. Every unknown address is caught inside the site's frame, by
 * app/(site)/[...missing]; this only shows if that route itself is ever out of the way.
 */
export default function NotFound() {
  return <ScreenNotFound />
}
