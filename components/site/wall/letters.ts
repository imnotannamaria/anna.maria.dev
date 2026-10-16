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

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

/** `2026-10` as "oct 2026". From the string alone, so the server and the browser agree. */
function monthLabel(month: string): string | undefined {
  const [year, number] = month.split("-")
  const name = MONTHS[Number(number) - 1]
  return year && name ? `${name} ${year}` : undefined
}

export function toLetter(
  testimonial: Omit<Testimonial, "reactions"> & { reactions?: ReactionCounts },
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
    when: monthLabel(testimonial.month),
    reactions: testimonial.reactions ?? reactionCounts(null),
  }
}
