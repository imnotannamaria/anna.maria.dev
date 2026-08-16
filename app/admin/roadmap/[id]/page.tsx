import { notFound } from "next/navigation"
import { RoadmapItemForm } from "@/components/admin/roadmap-item-form"
import { requireAdmin } from "@/lib/auth/require-admin"
import { getItemById } from "@/lib/roadmap/queries"

export const dynamic = "force-dynamic"

export default async function EditRoadmapItemPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const item = await getItemById(id)
  if (!item) notFound()

  return (
    <>
      <h1
        className="mb-1 font-serif text-4xl leading-none font-normal tracking-[-0.02em]"
        style={{ color: "var(--fg-primary)" }}
      >
        Edit
      </h1>
      <p className="text-mono-sm mb-6 font-mono" style={{ color: "var(--fg-muted)" }}>
        {item.slug}
      </p>
      <RoadmapItemForm item={item} />
    </>
  )
}
