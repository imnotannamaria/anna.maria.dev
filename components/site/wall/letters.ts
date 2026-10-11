import type { Testimonial } from "@/lib/wall/validation"

/** A letter on the wall: an approved testimonial, in the shape the mural draws. */
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
}

export function toLetter(testimonial: Testimonial): Letter {
  return {
    id: testimonial.id,
    name: testimonial.name,
    company: testimonial.company,
    role: testimonial.role ?? undefined,
    text: testimonial.message,
    lang: testimonial.lang,
    photo: testimonial.avatarUrl ?? undefined,
    linkedin: testimonial.linkedinUrl ?? undefined,
  }
}
