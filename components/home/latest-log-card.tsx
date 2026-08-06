import Link from "next/link"
import { StarRating } from "@/components/log/star-rating"
import { TYPE_LABEL, type LogEntry } from "@/lib/log/validation"

/** Current month as "YYYY-MM", in my timezone rather than the server's. */
function currentMonth(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date())
  const y = parts.find((p) => p.type === "year")?.value
  const m = parts.find((p) => p.type === "month")?.value
  return `${y}-${m}`
}

/**
 * The tall card in "off the clock". Built to fill a column top to bottom rather than sit
 * as a wide strip, so it reads as its own panel next to the wristkit one.
 *
 * Takes the whole published list as a prop instead of querying, so the home page makes one
 * trip to the database. Everything shown is derived from real columns — there is no goal
 * or streak here, because there is no such thing in `log_entries`.
 */
export function LatestLogCard({ entries }: { entries: LogEntry[] }) {
  if (entries.length === 0) return null

  const month = currentMonth()
  const thisMonth = entries.filter((e) => e.loggedAt.startsWith(month))
  const scope = thisMonth.length > 0 ? thisMonth : entries
  const favourites = scope.filter((e) => e.favorite).length
  const pct = scope.length > 0 ? Math.round((favourites / scope.length) * 100) : 0

  // The feed leads with albums; "recent" should mean recent.
  const byDate = [...entries].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt))
  const hero = entries[0]
  const recent = byDate.filter((e) => e.id !== hero.id).slice(0, 4)

  return (
    <Link
      href="/log"
      aria-label="Open the log"
      style={{ textDecoration: "none" }}
      className="group/log block h-full"
    >
      <div
        className="flex h-full flex-col overflow-hidden rounded-2xl border hover:-translate-y-0.5 hover:shadow-(--shadow-card-hover)"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-strong)",
          transition: "transform 200ms var(--ease-out), box-shadow 200ms var(--ease-out)",
        }}
      >
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div>
            <h3
              className="font-mono text-[11px] font-normal tracking-[0.08em] uppercase"
              style={{ color: "var(--fg-secondary)", margin: 0 }}
            >
              <span aria-hidden style={{ color: "var(--fg-brand)", fontSize: 10 }}>
                ◆
              </span>{" "}
              log
            </h3>
            <p
              className="mt-1.5 font-serif text-3xl leading-none"
              style={{ color: "var(--fg-primary)", margin: 0 }}
            >
              This{" "}
              <em className="italic" style={{ color: "var(--fg-brand)" }}>
                {thisMonth.length > 0 ? "month" : "year"}
              </em>
            </p>
          </div>

          <Summary count={scope.length} favourites={favourites} pct={pct} />

          <Hero entry={hero} />

          {recent.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span
                className="font-mono text-[10px] tracking-[0.08em] uppercase"
                style={{ color: "var(--fg-muted)" }}
              >
                recent
              </span>
              {recent.map((entry) => (
                <RecentRow key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-between gap-3 px-5 py-2.5 font-mono text-[11px]"
          style={{ background: "var(--fg-brand)", color: "rgba(255,255,255,0.95)" }}
        >
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden>◆</span> open log
            <span
              aria-hidden
              className="transition-transform group-hover/log:translate-x-0.5"
              style={{ display: "inline-block" }}
            >
              →
            </span>
          </span>
          <span style={{ opacity: 0.8 }}>{entries.length} logged</span>
        </div>
      </div>
    </Link>
  )
}

const RADIUS = 24
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function Summary({ count, favourites, pct }: { count: number; favourites: number; pct: number }) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl border p-3.5"
      style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface-elevated)" }}
    >
      <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden className="shrink-0">
        <circle
          cx="32"
          cy="32"
          r={RADIUS}
          fill="none"
          strokeWidth="6"
          style={{ stroke: "var(--border-strong)" }}
        />
        <circle
          cx="32"
          cy="32"
          r={RADIUS}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          transform="rotate(-90 32 32)"
          style={{ stroke: "var(--fg-brand)" }}
        />
        <text
          x="32"
          y="32"
          textAnchor="middle"
          dominantBaseline="central"
          className="font-mono"
          style={{ fill: "var(--fg-primary)", fontSize: 13 }}
        >
          {pct}%
        </text>
      </svg>

      <p
        className="font-sans text-[13px] leading-snug"
        style={{ color: "var(--fg-secondary)", margin: 0 }}
      >
        {count} {count === 1 ? "thing" : "things"} logged
        {favourites > 0 && (
          <>
            {" — "}
            <span style={{ color: "var(--fg-primary)" }}>
              {favourites} {favourites === 1 ? "favourite" : "favourites"}
            </span>
          </>
        )}
        .
      </p>
    </div>
  )
}

function Hero({ entry }: { entry: LogEntry }) {
  return (
    <div
      className="flex gap-3.5 rounded-xl border p-3"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div
        className="relative aspect-2/3 w-16 shrink-0 overflow-hidden rounded-md border"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-canvas)" }}
      >
        {entry.posterUrl ? (
          // Plain <img>, same reason as the /log card: no host allowlist to maintain.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.posterUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="absolute inset-0 grid place-items-center font-mono text-[8px] uppercase"
            style={{ color: "var(--fg-muted)" }}
          >
            {TYPE_LABEL[entry.type]}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[10px] tracking-[0.04em] uppercase"
            style={{ color: "var(--fg-brand-hover)" }}
          >
            {TYPE_LABEL[entry.type]}
          </span>
          {entry.favorite && (
            <>
              <span aria-hidden style={{ color: "var(--fg-brand)", fontSize: 12 }}>
                ♥
              </span>
              <span className="sr-only">favorite</span>
            </>
          )}
        </div>

        <p
          className="truncate font-serif text-lg leading-tight"
          style={{ color: "var(--fg-primary)", margin: 0 }}
        >
          {entry.title}
        </p>

        {entry.rating != null && <StarRating rating={entry.rating} size={13} />}

        {(entry.creator || entry.year) && (
          <p
            className="truncate font-mono text-[10px]"
            style={{ color: "var(--fg-muted)", margin: 0 }}
          >
            {[entry.creator, entry.year].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </div>
  )
}

function RecentRow({ entry }: { entry: LogEntry }) {
  return (
    <div
      className="flex items-center justify-between gap-3 border-t pt-1.5"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <span
        className="min-w-0 truncate font-mono text-[12px]"
        style={{ color: "var(--fg-secondary)" }}
      >
        {entry.title}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {entry.rating != null && <StarRating rating={entry.rating} size={11} />}
        <span
          className="rounded-sm px-1.5 py-px font-mono text-[9px] tracking-[0.04em] uppercase"
          style={{ background: "var(--bg-surface-brand)", color: "var(--fg-brand-hover)" }}
        >
          {TYPE_LABEL[entry.type]}
        </span>
      </span>
    </div>
  )
}
