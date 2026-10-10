"use client"

import { ChromeError } from "@/components/ui/chrome-error"

/**
 * Covers every admin page. Postgres is the only thing here that fails at request time. Only I
 * ever see this, so it shows the digest — the handle for searching the Vercel logs.
 *
 * The container padding is stripped because the admin layout already provides it; without
 * that override the shared surface would double it up inside the layout's box.
 */
export default function AdminError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ChromeError
      {...props}
      logTag="[admin] page failed"
      command="log --admin"
      title="Something broke"
      note="// probably the database. nothing was saved."
      showDigest
      className="max-w-none px-0 py-0 sm:px-0 md:px-0 lg:px-0 lg:py-0"
    />
  )
}
