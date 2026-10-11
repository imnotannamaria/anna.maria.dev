"use client"

import { ScreenError } from "@/components/site/frame/screen-state"

/** Covers every admin page. Postgres is the only thing here that fails at request time. */
export default function AdminError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ScreenError {...props} />
}
