"use client"

import { ChromeError } from "@/components/ui/chrome-error"

/**
 * `Home()` already guards the log query with its own `.catch`, and wristkit and GitHub both
 * return null-safe instead of throwing, so this only fires for something unexpected — a bug
 * in the render itself. Defence in depth, same reason /log and /roadmap have one.
 */
export default function HomeError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ChromeError
      {...props}
      logTag="[home] page failed"
      command="whoami"
      title="Something broke"
      note="// couldn't load the page. it's the database, not you."
    />
  )
}
