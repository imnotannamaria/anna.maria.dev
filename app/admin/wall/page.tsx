import Link from "next/link"
import { PlusIcon } from "@phosphor-icons/react/dist/ssr"
import { buttonVariants } from "@/app/components/entrepta/button-variants"
import { WallEntryTable } from "@/components/admin/wall-entry-table"
import { requireAdmin } from "@/lib/auth/require-admin"
import { getAllEntries } from "@/lib/wall/queries"

/** Every invite and every testimonial, including what is waiting and what was rejected. */
export const dynamic = "force-dynamic"

export default async function AdminWallPage() {
  // The layout guards this too. Both, deliberately: a layout can be removed in a refactor and
  // the page would keep rendering.
  await requireAdmin()
  const entries = await getAllEntries()
  const toReview = entries.filter((e) => e.status === "submitted").length
  const onWall = entries.filter((e) => e.status === "approved").length

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="text-display-md font-serif leading-none font-normal tracking-[-0.02em]"
            style={{ color: "var(--fg-primary)" }}
          >
            Wall of love
          </h1>
          <p className="text-mono-sm mt-2 font-mono" style={{ color: "var(--fg-muted)" }}>
            {entries.length} total · {toReview} to review · {onWall} on the wall
          </p>
        </div>

        <Link href="/admin/wall/new" data-sound="click" className={buttonVariants()}>
          <PlusIcon size={14} weight="bold" aria-hidden />
          new invite
        </Link>
      </div>

      <WallEntryTable entries={entries} />
    </>
  )
}
