import type { Metadata } from "next"
import { ScreenNotFound } from "@/components/site/frame/screen-state"

export const metadata: Metadata = { title: "Page not found" }

export default function NotFound() {
  return <ScreenNotFound />
}
