"use client"

import { ScreenError } from "@/components/site/frame/screen-state"

export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ScreenError {...props} />
}
