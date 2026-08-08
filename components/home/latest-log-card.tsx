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

/** How many posters the shelf holds at its widest. */
const SHELF_SIZE = 6

const RADIUS = 15
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * The log on the home page: a full-width shelf under the other widgets.
 *
 * It was a tall column first, which meant that row could only line up by stretching one of
 * its neighbours. On its own row it has no neighbours to match, so the height problem
 * disappears — and the width buys room for six posters instead of one.
 *
 * The poster grid is the "1a gallery wall" from docs/log-design.html, the layout that lost
 * to `1b` on the /log page because it had to survive entries with no artwork. Here it only
 * ever shows the leading few, so it gets to win.
 *
 * Takes the whole published list as a prop rather than querying, so the home page makes one
 * trip to the database. Everything shown comes from real columns — there is no goal or
 * streak, because there is no such thing in `log_entries`.
 */
export function LatestLogCard({ entries }: { entries: LogEntry[] }) {
  if (entries.length === 0) return null

  const month = currentMonth()
  const thisMonth = entries.filter((e) => e.loggedAt.startsWith(month))
  const scope = thisMonth.length > 0 ? thisMonth : entries
  const favourites = scope.filter((e) => e.favorite).length
  const pct = scope.length > 0 ? Math.round((favourites / scope.length) * 100) : 0

  const shelf = entries.slice(0, SHELF_SIZE)

  return (
    <Link
      href="/log"
      aria-label="Open the log"
      style={{ textDecoration: "none" }}
      className="group/log block"
    >
      <div
        className="overflow-hidden rounded-2xl border transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow-card-hover)"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-strong)" }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b px-4 py-3"
          style={{ borderColor: "var(--border-subtle)", background: "var(--bg-chrome)" }}
        >
          <div className="flex items-baseline gap-3">
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
              className="font-serif text-xl leading-none"
              style={{ color: "var(--fg-primary)", margin: 0 }}
            >
              This{" "}
              <em className="italic" style={{ color: "var(--fg-brand)" }}>
                {thisMonth.length > 0 ? "month" : "year"}
              </em>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Ring pct={pct} />
            <p
              className="font-sans text-[13px]"
              style={{ color: "var(--fg-secondary)", margin: 0 }}
            >
              {scope.length} logged
              {favourites > 0 && (
                <>
                  {" — "}
                  <span style={{ color: "var(--fg-primary)" }}>{favourites} favourites</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-4 lg:grid-cols-6">
          {shelf.map((entry) => (
            <ShelfItem key={entry.id} entry={entry} />
          ))}
        </div>

        <div
          className="flex items-center justify-between gap-3 px-4 py-2.5 font-mono text-[11px]"
          style={{ background: "var(--fg-brand)", color: "rgba(255,255,255,0.95)" }}
        >
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden>◆</span> open log
            <span
              aria-hidden
              className="inline-block transition-transform group-hover/log:translate-x-0.5"
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

function Ring({ pct }: { pct: number }) {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" aria-hidden className="shrink-0">
      <circle
        cx="19"
        cy="19"
        r={RADIUS}
        fill="none"
        strokeWidth="4"
        style={{ stroke: "var(--border-strong)" }}
      />
      <circle
        cx="19"
        cy="19"
        r={RADIUS}
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
        transform="rotate(-90 19 19)"
        style={{ stroke: "var(--fg-brand)" }}
      />
    </svg>
  )
}

function ShelfItem({ entry }: { entry: LogEntry }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div
        className="relative aspect-2/3 overflow-hidden rounded-lg border"
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
            className="absolute inset-0 grid place-items-center font-mono text-[9px] uppercase"
            style={{ color: "var(--fg-muted)" }}
          >
            {TYPE_LABEL[entry.type]}
          </span>
        )}

        <span
          className="absolute top-1.5 left-1.5 inline-flex h-4 items-center rounded-sm px-1.5 font-mono text-[8px] tracking-[0.04em] uppercase backdrop-blur-[2px]"
          style={{ background: "rgba(9,9,11,0.72)", color: "#e4e4e7" }}
        >
          {TYPE_LABEL[entry.type]}
        </span>

        {entry.favorite && (
          <>
            <span
              aria-hidden
              className="absolute top-1 right-1.5 leading-none"
              style={{
                color: "var(--fg-brand)",
                fontSize: 15,
                textShadow: "0 1px 3px rgba(0,0,0,0.6)",
              }}
            >
              ♥
            </span>
            <span className="sr-only">favorite</span>
          </>
        )}
      </div>

      <div className="min-w-0">
        <p
          className="truncate font-mono text-[11px]"
          style={{ color: "var(--fg-primary)", margin: 0 }}
        >
          {entry.title}
        </p>
        <div className="mt-0.5 flex items-center justify-between gap-1.5">
          {entry.rating != null && <StarRating rating={entry.rating} size={10} />}
          {entry.year && (
            <span className="font-mono text-[9px]" style={{ color: "var(--fg-muted)" }}>
              {entry.year}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
