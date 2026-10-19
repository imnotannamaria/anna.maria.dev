import { HTML_LANG, type Locale } from "@/lib/i18n/locales"
import { reactionCounts, type ReactionCounts } from "@/lib/wall/constants"
import type { Testimonial } from "@/lib/wall/validation"

/** A letter on the wall: an approved testimonial, in the shape a message draws. */
export type Letter = {
  id: string
  name: string
  company: string
  role?: string
  text: string
  /** The language it was written in, for the `lang` attribute. */
  lang?: string
  photo?: string
  linkedin?: string
  /** When it went up, as a message's timestamp reads: "oct 2026". Absent on a preview. */
  when?: string
  reactions: ReactionCounts
}

/** UTC keeps a month label stable on the server and in the browser. */
export function monthLabel(month: string, locale: Locale): string | undefined {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return undefined
  return new Intl.DateTimeFormat(HTML_LANG[locale], {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`))
}

export function toLetter(
  testimonial: Omit<Testimonial, "reactions"> & { reactions?: ReactionCounts },
  locale: Locale = "en",
): Letter {
  return {
    id: testimonial.id,
    name: testimonial.name,
    company: testimonial.company,
    role: testimonial.role ?? undefined,
    text: testimonial.message,
    lang: testimonial.lang,
    photo: testimonial.avatarUrl ?? undefined,
    linkedin: testimonial.linkedinUrl ?? undefined,
    when: monthLabel(testimonial.month, locale),
    reactions: testimonial.reactions ?? reactionCounts(null),
  }
}
