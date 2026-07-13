import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function countWords(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200
  return Math.ceil(countWords(content) / wordsPerMinute)
}

/** GitHub-style slug for heading anchors (matches the ids set on rendered headings). */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}
