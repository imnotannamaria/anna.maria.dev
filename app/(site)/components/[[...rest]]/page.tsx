import type { Metadata } from "next"
import { ScreenRemoved } from "@/components/site/frame/screen-state"

export const metadata: Metadata = {
  title: "Removed in v3",
  robots: { index: false, follow: true },
}

/** This page left the site in v3. The address still answers, to say so. */
export default function Page() {
  return <ScreenRemoved name="The components page" />
}
