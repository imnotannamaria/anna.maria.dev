import type { ScreenId } from "@/components/site/pages"

export type Note = {
  slug: string
  title: string
  summary: string
  tags: string[]

  date: string
  year: string

  month: string
  day: number
  minutes: number
  words: number

  featured: boolean

  opening?: string
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

export function readDate(iso: string): Pick<Note, "year" | "month" | "day"> {
  return {
    year: iso.slice(0, 4),
    month: MONTHS[Number(iso.slice(5, 7)) - 1] ?? "",
    day: Number(iso.slice(8, 10)),
  }
}

export function shortDate(note: Note): string {
  return `${note.month} ${note.day}, ${note.year}`
}

export function noteScreen(note: Pick<Note, "slug">): ScreenId {
  return `post:${note.slug}`
}
