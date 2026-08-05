import type { Metadata } from "next"
import { signOut } from "@workos-inc/authkit-nextjs"
import { requireAdmin } from "@/lib/auth/require-admin"
import { Button } from "@/app/components/entrepta/button"

export const metadata: Metadata = {
  title: "admin",
  robots: { index: false, follow: false },
}

/**
 * Placeholder. Phase 3 replaces this with the real /admin/log CRUD screens; for now it
 * exists so the auth flow has somewhere to land and can be tested end to end.
 */
export default async function AdminPage() {
  const user = await requireAdmin()

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono text-xs tracking-[0.08em] uppercase">
        <span style={{ color: "var(--fg-brand)" }}>$</span>{" "}
        <span style={{ color: "var(--fg-muted)" }}>whoami</span>
      </p>

      <h1
        className="mt-3 font-serif text-5xl"
        style={{ color: "var(--fg-primary)", letterSpacing: "-0.02em" }}
      >
        Signed in
      </h1>

      <p className="mt-4 font-mono text-sm" style={{ color: "var(--fg-secondary)" }}>
        {user?.email}
      </p>

      <p className="mt-8 font-mono text-xs" style={{ color: "var(--fg-muted)" }}>
        {"// /admin/log lands here in phase 3"}
      </p>

      <form
        action={async () => {
          "use server"
          await signOut()
        }}
        className="mt-8"
      >
        <Button type="submit" variant="secondary">
          Sign out
        </Button>
      </form>
    </div>
  )
}
