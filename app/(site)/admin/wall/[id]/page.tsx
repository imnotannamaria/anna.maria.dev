import { notFound } from "next/navigation"
import { WallEntryActions } from "@/components/admin/wall-entry-actions"
import { WallStatusBadge } from "@/components/admin/wall-status-badge"
import { toLetter } from "@/components/site/wall/letters"
import { Channel } from "@/components/site/wall/channel"
import { requireAdmin } from "@/lib/auth/require-admin"
import { LANG_LABEL } from "@/lib/wall/constants"
import { formatInstant, statusOf } from "@/lib/wall/describe"
import { getEntryById } from "@/lib/wall/queries"

export const dynamic = "force-dynamic"

/**
 * One row, read in full before deciding. The card is drawn exactly as the wall will draw it,
 * so approving is approving what you see.
 */
export default async function WallEntryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const entry = await getEntryById(id)
  if (!entry) notFound()

  const status = statusOf(entry)
  const written = entry.message && entry.lang

  const facts: [string, string][] = [
    ["created", formatInstant(entry.createdAt)],
    ["form opened in", LANG_LABEL[entry.formLang]],
    ...(entry.status === "invited"
      ? ([["link expires", formatInstant(entry.expiresAt)]] as [string, string][])
      : []),
    ...(entry.submittedAt
      ? ([["sent", formatInstant(entry.submittedAt)]] as [string, string][])
      : []),
    ...(entry.decidedAt
      ? ([["decided", formatInstant(entry.decidedAt)]] as [string, string][])
      : []),
    ...(entry.linkedinUrl ? ([["linkedin", entry.linkedinUrl]] as [string, string][]) : []),
  ]

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1
          className="text-display-md m-0 font-serif leading-none font-normal tracking-[-0.02em]"
          style={{ color: "var(--fg-primary)" }}
        >
          {entry.name}
        </h1>
        <WallStatusBadge status={status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
        <div className="flex min-w-0 flex-col gap-6">
          {written ? (
            <Channel
              preview
              letters={[
                toLetter({
                  id: entry.id,
                  month: "",
                  name: entry.name,
                  company: entry.company,
                  role: entry.role,
                  linkedinUrl: entry.linkedinUrl,
                  message: entry.message ?? "",
                  lang: entry.lang ?? entry.formLang,
                  avatarUrl: entry.avatarUrl,
                  reactions: entry.reactions,
                }),
              ]}
            />
          ) : (
            <p className="text-mono-md m-0 font-mono" style={{ color: "var(--fg-muted)" }}>
              {status === "expired"
                ? "The link expired before anything was written. A new link gives another day."
                : "Nothing written yet. The link only exists in plain text where it was created; lost, it is renewed."}
            </p>
          )}

          {entry.note && (
            <div>
              <div
                className="text-mono-xs mb-2 font-mono tracking-[0.08em] uppercase"
                style={{ color: "var(--fg-muted)" }}
              >
                your note
              </div>
              <p
                lang={entry.formLang}
                className="text-body-md m-0 font-sans leading-relaxed whitespace-pre-line"
                style={{ color: "var(--fg-secondary)" }}
              >
                {entry.note}
              </p>
            </div>
          )}

          <WallEntryActions id={entry.id} name={entry.name} status={entry.status} />
        </div>

        <dl className="text-mono-sm m-0 flex flex-col gap-3 font-mono">
          {facts.map(([term, value]) => (
            <div key={term} className="flex min-w-0 flex-col gap-0.5">
              <dt style={{ color: "var(--fg-muted)" }}>{term}</dt>
              <dd className="m-0 break-all" style={{ color: "var(--fg-secondary)" }}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  )
}
