import Link from "next/link"
import { StarRating } from "@/components/log/star-rating"
import { LOG_TYPES, TYPE_LABEL, TYPE_PLURAL, type LogEntry } from "@/lib/log/validation"

/** Today in my timezone, as "YYYY-MM-DD". */
function today(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

/** Few enough to stay a highlight rather than a second copy of /log. */
const SHELF_SIZE = 5

/**
 * The log on the home page: a full-width strip under the other widgets.
 *
 * Posters on the left, numbers on the right. It was six stretched posters and nothing
 * else, which left the right half of a wide card empty — the shelf is capped at five now
 * and the space it gives back carries the counts instead.
 *
 * The five are favourites, in the same order /log uses (albums first), so the home page
 * leads with the same thing the page does rather than inventing its own ranking.
 *
 * Takes the whole published list as a prop rather than querying, so the home page makes one
 * trip to the database. Everything here comes from real columns — there is no goal or
 * streak, because there is no such thing in `log_entries`.
 */
export function LatestLogCard({ entries }: { entries: LogEntry[] }) {
  if (entries.length === 0) return null

  const day = today()
  const month = day.slice(0, 7)
  const year = day.slice(0, 4)

  const favourites = entries.filter((e) => e.favorite)
  // `entries` already arrives albums-first, so filtering keeps that order.
  const shelf = (favourites.length > 0 ? favourites : entries).slice(0, SHELF_SIZE)

  const stats = [
    { label: "this month", value: entries.filter((e) => e.loggedAt.startsWith(month)).length },
    { label: "this year", value: entries.filter((e) => e.loggedAt.startsWith(year)).length },
    { label: "favourites", value: favourites.length },
    { label: "all time", value: entries.length },
  ]

  const byType = LOG_TYPES.map((type) => ({
    type,
    count: entries.filter((e) => e.type === type).length,
  })).filter((t) => t.count > 0)

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
          className="flex items-baseline gap-3 border-b px-4 py-3"
          style={{ borderColor: "var(--border-subtle)", background: "var(--bg-chrome)" }}
        >
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
            A few{" "}
            <em className="italic" style={{ color: "var(--fg-brand)" }}>
              favourites
            </em>
          </p>
        </div>

        <div className="flex flex-col gap-5 p-4 lg:flex-row lg:items-stretch lg:gap-8">
          <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
            {shelf.map((entry) => (
              <ShelfItem key={entry.id} entry={entry} />
            ))}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between gap-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border px-3 py-2"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <div
                    className="mb-1 font-mono text-[10px] tracking-[0.08em] uppercase"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {s.label}
                  </div>
                  <div
                    className="font-serif text-2xl leading-none tracking-[-0.02em] italic"
                    style={{ color: "var(--fg-brand)" }}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            <TypeBreakdown byType={byType} total={entries.length} />
          </div>
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

/**
 * A stacked bar of the type split, with the legend under it.
 *
 * Each segment is the brand colour mixed further into the canvas, so the ramp follows
 * whichever of the six themes is active instead of pinning six literal colours.
 */
function TypeBreakdown({
  byType,
  total,
}: {
  byType: { type: (typeof LOG_TYPES)[number]; count: number }[]
  total: number
}) {
  if (byType.length === 0) return null

  const shade = (i: number) =>
    `color-mix(in srgb, var(--fg-brand) ${100 - i * 13}%, var(--bg-canvas))`

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex h-2 w-full overflow-hidden rounded-full"
        style={{ background: "var(--border-subtle)" }}
        aria-hidden
      >
        {byType.map((t, i) => (
          <span
            key={t.type}
            style={{ width: `${(t.count / total) * 100}%`, background: shade(i) }}
          />
        ))}
      </div>

      <ul className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px]">
        {byType.map((t, i) => (
          <li key={t.type} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: shade(i) }}
            />
            <span style={{ color: "var(--fg-secondary)" }}>{TYPE_PLURAL[t.type]}</span>
            <span style={{ color: "var(--fg-muted)" }}>{t.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ShelfItem({ entry }: { entry: LogEntry }) {
  return (
    <div className="flex w-22 flex-col gap-1.5 sm:w-24 lg:w-26">
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
