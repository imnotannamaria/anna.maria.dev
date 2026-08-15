import type { Metadata } from "next"
import Link from "next/link"
import { buttonVariants } from "@/app/components/entrepta/button-variants"

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
 */
export default function NotFound() {
  return (
    <div
      className="mx-auto flex flex-col px-4 py-6 sm:px-6 md:px-8 lg:px-12 lg:py-8"
      style={{ maxWidth: 1280, minHeight: "60vh" }}
    >
      <div
        className="mb-3 font-mono text-xs tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-muted)" }}
      >
        <span style={{ color: "var(--fg-brand)" }}>$</span> cat ./page
      </div>

      <p className="m-0 font-mono text-[13px]" style={{ color: "var(--fg-muted)" }}>
        cat: ./page: No such file or directory
      </p>

      <h1
        className="mt-4 font-serif text-[40px] leading-none font-normal tracking-[-0.02em]"
        style={{ color: "var(--fg-primary)" }}
      >
        Page not found
      </h1>

      <p className="mt-4 font-mono text-[13px]" style={{ color: "var(--fg-muted)" }}>
        {"// check the url, or head back."}
      </p>

      {/* buttonVariants, not <Button asChild>: Button always wraps its children in a span,
          which breaks the Radix Slot single-child contract this needs — that combination
          isn't used anywhere else in the codebase. */}
      <div className="mt-6">
        <Link href="/" className={buttonVariants({ variant: "secondary" })}>
          cd ~
        </Link>
      </div>
    </div>
  )
}
