import { STATUS_LABEL } from "./constants"
import type { WallEntry } from "./validation"

/**
 * An instant in São Paulo, short: `Oct 5, 14:32`.
 *
 * Only ever called from server components. The admin rows are a client component, and a date
 * formatted there would be formatted twice — once in the server's zone and once in the
 * browser's — which is a hydration mismatch for anyone not in UTC.
 */
export function formatInstant(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso))
}

export type StatusKey = keyof typeof STATUS_LABEL

/** The status a row shows: `invited` splits into waiting and expired. */
export function statusOf(entry: WallEntry): StatusKey {
  return entry.status === "invited" && entry.expired ? "expired" : entry.status
}

/** The one date that matters for where a row is now. */
export function whenOf(entry: WallEntry): string {
  switch (statusOf(entry)) {
    case "invited":
      return `expires ${formatInstant(entry.expiresAt)}`
    case "expired":
      return `expired ${formatInstant(entry.expiresAt)}`
    case "submitted":
      return `sent ${formatInstant(entry.submittedAt ?? entry.createdAt)}`
    default:
      return `decided ${formatInstant(entry.decidedAt ?? entry.createdAt)}`
  }
}
