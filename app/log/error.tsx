"use client"

import { ChromeError } from "@/components/ui/chrome-error"

/**
 * The database is the only thing here that can fail at request time. Deliberately not an
 * empty feed: `getPublishedEntries` returning `[]` means "nothing logged", and showing that
 * when Postgres is unreachable would be a lie.
 */
export default function LogError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ChromeError
      {...props}
      logTag="[log] page failed"
      command="log --all"
      title="Log"
      note="// couldn't reach the log. it's the database, not you."
      className="max-w-[1020px]"
    />
  )
}
