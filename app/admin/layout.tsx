import type { Metadata } from "next"
import Link from "next/link"
import { LockKeyIcon } from "@phosphor-icons/react/dist/ssr"
import { signOut } from "@workos-inc/authkit-nextjs"
import { Button } from "@/app/components/entrepta/button"
import { RootShell } from "@/app/root-shell"
import { SiteShell } from "@/components/site/frame/site-shell"
import { PageLabel } from "@/components/site/page-header"
import { requireAdmin } from "@/lib/auth/require-admin"
import "./admin.css"

export const metadata: Metadata = {
  title: "admin",
  // The allowlist already makes this a 404 for everyone else, but a crawler that somehow
  // reaches it should not index it either. Also excluded in next-sitemap.config.js.
  robots: { index: false, follow: false },
}

const SECTIONS = [
  { href: "/admin/log", label: "log" },
  { href: "/admin/wall", label: "wall of love" },
  { href: "/admin/memory", label: "memory" },
]

/**
 * The guard for every admin page. It runs here rather than only in proxy.ts, because a
 * matcher can be edited wrong and this cannot.
 *
 * The admin sits in the site's frame like any other page, with the page label on top and its
 * sections and the signed-in account under it. It is a root layout of its own, outside the
 * language segment the public pages live under: it is a tool with one reader, in English, and
 * staying out keeps the session proxy and the language proxy from touching the same request.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin()

  return (
    <RootShell locale="en">
      <SiteShell>
        <div className="st-room st-screen st-admin">
          <header className="st-admin-top">
            <PageLabel icon={<LockKeyIcon aria-hidden size={13} weight="bold" />} label="admin" />
            <nav aria-label="Admin sections" className="st-admin-nav text-mono-sm font-mono">
              {SECTIONS.map((section) => (
                <Link key={section.href} href={section.href} className="focus-ring">
                  {section.label}
                </Link>
              ))}
            </nav>
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-mono-sm min-w-0 truncate font-mono text-[var(--fg-muted)]">
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
          </header>

          {children}
        </div>
      </SiteShell>
    </RootShell>
  )
}
