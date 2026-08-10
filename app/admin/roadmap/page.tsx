import Link from "next/link"
import { PlusIcon } from "@phosphor-icons/react/dist/ssr"
import { buttonVariants } from "@/app/components/entrepta/button-variants"
import { RoadmapItemTable } from "@/components/admin/roadmap-item-table"
import { RoadmapQuickAdd } from "@/components/admin/roadmap-quick-add"
import { requireAdmin } from "@/lib/auth/require-admin"
import { getAllItems } from "@/lib/roadmap/queries"

/** Raw items included — this is the only place they exist. */
export const dynamic = "force-dynamic"

export default async function AdminRoadmapPage() {
  // The layout guards this too. Both, deliberately: a layout can be removed in a refactor
  // and the page would keep rendering.
  await requireAdmin()
  const items = await getAllItems()
  const raw = items.filter((i) => i.status === "raw").length

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div
            className="mb-2 font-mono text-xs tracking-[0.08em] uppercase"
            style={{ color: "var(--fg-muted)" }}
          >
            <span style={{ color: "var(--fg-brand)" }}>$</span> roadmap --admin
          </div>
          <h1
            className="font-serif text-4xl leading-none font-normal tracking-[-0.02em]"
            style={{ color: "var(--fg-primary)" }}
          >
            Roadmap
          </h1>
          <p className="mt-2 font-mono text-[11px]" style={{ color: "var(--fg-muted)" }}>
            {items.length} total · {raw} raw
          </p>
        </div>

        {/* buttonVariants, not <Button> inside <Link>: that renders a <button> nested in an
            <a>, which is invalid and gives one destination two tab stops. */}
        <Link href="/admin/roadmap/new" className={buttonVariants()}>
          <PlusIcon size={14} weight="bold" aria-hidden />
          new item
        </Link>
      </div>

      <RoadmapQuickAdd />

      <RoadmapItemTable items={items} />
    </>
  )
}
