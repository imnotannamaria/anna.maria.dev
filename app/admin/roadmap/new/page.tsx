import { RoadmapItemForm } from "@/components/admin/roadmap-item-form"
import { requireAdmin } from "@/lib/auth/require-admin"

export default async function NewRoadmapItemPage() {
  await requireAdmin()

  return (
    <>
      <h1
        className="mb-6 font-serif text-4xl leading-none font-normal tracking-[-0.02em]"
        style={{ color: "var(--fg-primary)" }}
      >
        New item
      </h1>
      <RoadmapItemForm />
    </>
  )
}
