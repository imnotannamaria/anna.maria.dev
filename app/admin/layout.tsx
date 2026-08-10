import type { Metadata } from "next"
import Link from "next/link"
import { signOut } from "@workos-inc/authkit-nextjs"
import { requireAdmin } from "@/lib/auth/require-admin"
import { Button } from "@/app/components/entrepta/button"

export const metadata: Metadata = {
  title: "admin",
  // The allowlist already makes this a 404 for everyone else, but a crawler that somehow
  // reaches it should not index it either. Also excluded in next-sitemap.config.js.
  robots: { index: false, follow: false },
}

/**
 * The guard for every admin page. It runs here rather than only in proxy.ts, because a
 * matcher can be edited wrong and this cannot.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin()

  return (
    <div className="mx-auto w-full max-w-[1020px] px-5 py-10 sm:px-8">
      <div
        className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b pb-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <nav aria-label="Breadcrumb" className="font-mono text-xs">
          <Link href="/admin/log" style={{ color: "var(--fg-muted)" }}>
            ~
          </Link>
          <span aria-hidden style={{ opacity: 0.5, margin: "0 6px", color: "var(--fg-muted)" }}>
            /
          </span>
          <Link href="/admin/log" style={{ color: "var(--fg-primary)" }}>
            admin
          </Link>
        </nav>

        {/* Two things live here now, so the layout has to say so. */}
        <nav aria-label="Admin sections" className="flex items-center gap-3 font-mono text-xs">
          <Link href="/admin/log" style={{ color: "var(--fg-secondary)" }}>
            log
          </Link>
          <span aria-hidden style={{ opacity: 0.4, color: "var(--fg-muted)" }}>
            ·
          </span>
          <Link href="/admin/roadmap" style={{ color: "var(--fg-secondary)" }}>
            roadmap
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px]" style={{ color: "var(--fg-muted)" }}>
            {user?.email}
          </span>
          <form
            action={async () => {
              "use server"
              await signOut()
            }}
          >
            <Button type="submit" variant="ghost" size="sm">
              sign out
            </Button>
          </form>
        </div>
      </div>

      {children}
    </div>
  )
}
