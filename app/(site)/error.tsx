"use client"

import { ScreenError } from "@/components/site/frame/screen-state"

/** Any page of the site that throws. The frame stays, so the visitor can go somewhere else. */
export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ScreenError {...props} />
}
