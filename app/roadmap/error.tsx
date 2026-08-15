"use client"

import { ChromeError } from "@/components/ui/chrome-error"

/**
 * The database is the only thing here that can fail at request time. Deliberately not an
 * empty board: `getPublicItems` returning `[]` means "nothing on the board yet", and showing
 * that when Postgres is unreachable would be a lie — the same call /log made.
 */
export default function RoadmapError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ChromeError
      {...props}
      logTag="[roadmap] page failed"
      command="roadmap --all"
      title="Roadmap"
      note="// couldn't reach the board. it's the database, not you."
      className="max-w-[1180px]"
    />
  )
}
