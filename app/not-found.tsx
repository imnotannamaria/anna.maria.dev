import type { Metadata } from "next"
import Link from "next/link"
import { buttonVariants } from "@/app/components/entrepta/button-variants"
import { ChromeMessage } from "@/components/ui/chrome-message"

export const metadata: Metadata = { title: "Page not found" }

/**
 * Root-level, not per-route. `notFound()` in `/blog/[slug]` and `/projects/[slug]` both
 * bubble up to this, and without it they fell through to Next's default 404 — white,
 * unstyled, nothing like the rest of the site.
 *
 * It lives at `app/`, not inside the `(home)` group, so it stays a true 404 for every route
 * rather than only the ones under that group. See `(home)/loading.tsx` for why the group
 * exists in the first place — this file has no such constraint, `notFound()` already sets
 * the status code correctly wherever it's thrown from.
 *
 * It shares `ChromeMessage` with the error boundaries. A server component here, a client one
 * there, but the same surface — this passes a `<Link>` where they pass a reset `<Button>`.
 */
export default function NotFound() {
  return (
    <ChromeMessage
      command="cat ./page"
      output="cat: ./page: No such file or directory"
      title="Page not found"
      note="// check the url, or head back."
      action={
        // buttonVariants, not <Button asChild>: Button always wraps its children in a span,
        // which breaks the Radix Slot single-child contract that would need.
        <Link href="/" className={buttonVariants({ variant: "secondary" })}>
          cd ~
        </Link>
      }
    />
  )
}
